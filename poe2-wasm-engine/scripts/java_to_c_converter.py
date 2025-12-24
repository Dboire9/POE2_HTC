#!/usr/bin/env python3
"""
Java to C Database Converter
Converts POE2 Java item and modifier classes to C structs and data arrays
"""

import os
import re
import json
from pathlib import Path

# Tag mapping to bitflags
TAG_MAP = {
    'amanamu': 'TAG_AMANAMU',
    'kurgal': 'TAG_KURGAL',
    'ulaman': 'TAG_ULAMAN',
    'gem': 'TAG_GEM',
    'caster': 'TAG_CASTER',
    'caster_damage': 'TAG_CASTER',
    'fire': 'TAG_FIRE',
    'cold': 'TAG_COLD',
    'lightning': 'TAG_LIGHTNING',
    'chaos': 'TAG_CHAOS',
    'physical': 'TAG_PHYSICAL',
    'life': 'TAG_LIFE',
    'defences': 'TAG_DEFENCES',
    'elemental': 'TAG_ELEMENTAL',
    'attack': 'TAG_ATTACK',
    'minion': 'TAG_MINION',
    'aura': 'TAG_AURA',
    'mana': 'TAG_MANA',
    'speed': 'TAG_SPEED',
    'critical': 'TAG_CRITICAL',
    'damage': 'TAG_DAMAGE',
    'resistance': 'TAG_RESISTANCE',
    'attribute': 'TAG_ATTRIBUTE',
    'ailment': 'TAG_AILMENT',
    'curse': 'TAG_CURSE',
    'charm': 'TAG_CHARM',
}

from typing import List, Dict, Tuple, Optional

class JavaToCConverter:
    def __init__(self, java_base_path: str, output_path: str):
        self.java_base = Path(java_base_path)
        self.output = Path(output_path)
        self.modifiers = []
        self.items = []
        self.modifier_id_counter = 0
        self.item_id_counter = 0
        
    def parse_modifier_tier(self, tier_text: str) -> Optional[Dict]:
        """Parse ModifierTier constructor with 1-4 value pairs"""
        # Pattern: new ModifierTier("name", level, weight, Pair<>(min,max)[, Pair<>(min,max)]...)
        # Start with name, level, weight
        base_pattern = r'new\s+ModifierTier\s*\(\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*(\d+)\s*'
        match = re.search(base_pattern, tier_text)
        if not match:
            return None
        
        tier = {
            'name': match.group(1),
            'level': int(match.group(2)),
            'weight': int(match.group(3)),
            'values': []
        }
        
        # Find all Pair<>(...) values (supports both integers and decimals)
        pair_pattern = r'new\s+Pair<>\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)'
        pairs = re.findall(pair_pattern, tier_text)
        
        for min_val, max_val in pairs:
            # Convert to int (truncate decimals for now, since C uses int16_t)
            tier['values'].append({
                'min': int(float(min_val)),
                'max': int(float(max_val))
            })
        
        return tier if tier['values'] else None
    
    def parse_modifier(self, java_file: Path, var_name: str, content: str) -> Optional[Dict]:
        """Parse a Modifier static field definition"""
        # Find the modifier initialization block
        pattern = rf'{var_name}\s*=\s*new\s+Modifier\s*\((.*?)\);'
        match = re.search(pattern, content, re.DOTALL)
        if not match:
            return None
        
        modifier_block = match.group(1)
        
        # Extract file path info for unique identification
        file_path_str = str(java_file.relative_to(self.java_base))
        
        # Extract primary category (first string)
        category_match = re.search(r'"([^"]+)"', modifier_block)
        primary_category = category_match.group(1) if category_match else var_name.lower()
        
        # Extract tags (List.of("tag1", "tag2")) and convert to bitflags
        tags_match = re.search(r'List\.of\((.*?)\)', modifier_block)
        tags = []
        tags_bitflags = []
        if tags_match:
            tag_content = tags_match.group(1)
            tags = re.findall(r'"([^"]+)"', tag_content)
            # Convert to bitflags
            for tag in tags:
                if tag in TAG_MAP:
                    tags_bitflags.append(TAG_MAP[tag])
        
        # Combine tags with OR operator
        tags_expr = ' | '.join(tags_bitflags) if tags_bitflags else 'TAG_NONE'

        
        # Extract tiers (List.of(new ModifierTier(...), ...))
        tiers = []
        tier_matches = re.finditer(r'new\s+ModifierTier\s*\([^)]+\)', modifier_block)
        for tier_match in tier_matches:
            tier = self.parse_modifier_tier(tier_match.group(0))
            if tier:
                tiers.append(tier)
        
        # Extract type (PREFIX/SUFFIX)
        mod_type = 'PREFIX' if 'ModifierType.PREFIX' in modifier_block else 'SUFFIX'
        
        # Extract source (NORMAL/DESECRATED/ESSENCE)
        if 'ModifierSource.DESECRATED' in modifier_block:
            source = 'DESECRATED'
        elif 'ModifierSource.ESSENCE' in modifier_block:
            source = 'ESSENCE'
        elif 'ModifierSource.PERFECT_ESSENCE' in modifier_block:
            source = 'PERFECT_ESSENCE'
        else:
            source = 'NORMAL'
        
        # Extract name and description (last two string literals)
        # Format: ..., ModifierType.PREFIX, ModifierSource.NORMAL, "Name", "Description");
        all_strings = re.findall(r'"([^"]*)"', modifier_block)
        
        # Last two strings should be name and description
        if len(all_strings) >= 2:
            name = all_strings[-2]
            description = all_strings[-1]
        elif len(all_strings) == 1:
            name = all_strings[-1]
            description = all_strings[-1]
        else:
            name = var_name.replace('_', ' ').title()
            description = var_name.replace('_', ' ')
        
        return {
            'id': self.modifier_id_counter,
            'var_name': var_name,
            'file_path': str(java_file.relative_to(self.java_base)),
            'primary_category': primary_category,
            'tags': tags,
            'tags_expr': tags_expr,
            'tiers': tiers,
            'type': mod_type,
            'source': source,
            'name': name,
            'description': description
        }
    
    def parse_modifiers_file(self, java_file: Path):
        """Parse a Modifiers_normal.java or similar file"""
        with open(java_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find all public static final Modifier declarations
        var_pattern = r'public\s+static\s+final\s+Modifier\s+([A-Z_]+);'
        variables = re.findall(var_pattern, content)
        
        for var_name in variables:
            modifier = self.parse_modifier(java_file, var_name, content)
            if modifier:
                self.modifiers.append(modifier)
                self.modifier_id_counter += 1
                print(f"  ✓ Parsed modifier: {var_name} ({len(modifier['tiers'])} tiers)")
    
    def parse_item_file(self, java_file: Path):
        """Parse an Item class (e.g., Rings.java)"""
        with open(java_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Get class name from file
        class_match = re.search(r'public\s+class\s+(\w+)', content)
        if not class_match:
            return
        
        class_name = class_match.group(1)
        
        # Extract import statements to resolve which Modifiers_* files are used
        import_map = {}
        import_pattern = r'import\s+core\.Item_modifiers\.([^;]+);'
        imports = re.findall(import_pattern, content)
        
        for imp in imports:
            # Example: Body_Armours_Item_modifiers.Body_Armours_Normal_Item_modifiers.*
            parts = imp.split('.')
            if len(parts) >= 2:
                # Map the last part before .* to the full path
                if parts[-1] == '*':
                    # Get the package path (e.g., Body_Armours_Item_modifiers/Body_Armours_Normal_Item_modifiers)
                    package_path = '/'.join(parts[:-1])
                    import_map['Item_modifiers'] = package_path
        
        # Determine item class from folder structure and name
        item_class = self.determine_item_class(java_file, class_name)
        
        # Extract modifier lists
        allowed_mods = {
            'normal_prefixes': [],
            'normal_suffixes': [],
            'desecrated_prefixes': [],
            'desecrated_suffixes': [],
            'essence_prefixes': [],
            'essence_suffixes': []
        }
        
        # Parse Normal_allowedPrefixes
        prefix_pattern = r'Normal_allowedPrefixes\.add\(Modifiers_normal\.([A-Z_]+)\);'
        allowed_mods['normal_prefixes'] = re.findall(prefix_pattern, content)
        
        # Parse Normal_allowedSuffixes
        suffix_pattern = r'Normal_allowedSuffixes\.add\(Modifiers_normal\.([A-Z_]+)\);'
        allowed_mods['normal_suffixes'] = re.findall(suffix_pattern, content)
        
        # Parse Desecrated prefixes/suffixes
        des_prefix = r'Desecrated_allowedPrefixes\.add\(Modifiers_desecrated\.([A-Z_]+)\);'
        allowed_mods['desecrated_prefixes'] = re.findall(des_prefix, content)
        
        des_suffix = r'Desecrated_allowedSuffixes\.add\(Modifiers_desecrated\.([A-Z_]+)\);'
        allowed_mods['desecrated_suffixes'] = re.findall(des_suffix, content)
        
        # Parse Essence prefixes/suffixes
        ess_prefix = r'Essences_allowedPrefixes\.add\(Modifiers_essences\.([A-Z_]+)\);'
        allowed_mods['essence_prefixes'] = re.findall(ess_prefix, content)
        
        ess_suffix = r'Essences_allowedSuffixes\.add\(Modifiers_essences\.([A-Z_]+)\);'
        allowed_mods['essence_suffixes'] = re.findall(ess_suffix, content)
        
        item = {
            'id': self.item_id_counter,
            'class_name': class_name,
            'item_class': item_class,
            'allowed_mods': allowed_mods,
            'import_map': import_map  # Store imports for later resolution
        }
        
        self.items.append(item)
        self.item_id_counter += 1
        
        total_mods = sum(len(mods) for mods in allowed_mods.values())
        print(f"  ✓ Parsed item: {class_name} ({item_class}, {total_mods} mods)")
    
    def determine_item_class(self, file_path: Path, class_name: str) -> str:
        """Determine the ItemClass enum value from file path and name"""
        path_str = str(file_path).lower()
        name_lower = class_name.lower()
        
        # Check folder structure
        if 'helmets' in path_str:
            return 'CLASS_HELMET'
        elif 'body_armours' in path_str or 'bodyarmour' in name_lower:
            return 'CLASS_BODY_ARMOUR'
        elif 'gloves' in path_str:
            return 'CLASS_GLOVES'
        elif 'boots' in path_str:
            return 'CLASS_BOOTS'
        elif 'bows' in path_str:
            return 'CLASS_WEAPON_BOW'
        elif 'crossbows' in path_str:
            return 'CLASS_WEAPON_CROSSBOW'
        elif 'wands' in path_str:
            return 'CLASS_WEAPON_WAND'
        elif 'sceptres' in path_str:
            return 'CLASS_WEAPON_SCEPTRE'
        elif 'staves' in path_str and 'quarter' not in path_str:
            return 'CLASS_WEAPON_STAFF'
        elif 'quarterstaves' in path_str:
            return 'CLASS_WEAPON_QUARTERSTAFF'
        elif 'onehand_maces' in path_str:
            return 'CLASS_WEAPON_MACE_1H'
        elif 'twohand_maces' in path_str:
            return 'CLASS_WEAPON_MACE_2H'
        elif 'spears' in path_str:
            return 'CLASS_WEAPON_SPEAR'
        elif 'shields' in path_str:
            return 'CLASS_SHIELD'
        elif 'bucklers' in path_str:
            return 'CLASS_BUCKLER'
        elif 'foci' in path_str:
            return 'CLASS_FOCUS'
        elif 'quivers' in path_str:
            return 'CLASS_QUIVER'
        elif 'amulets' in path_str:
            return 'CLASS_AMULET'
        elif 'rings' in path_str:
            return 'CLASS_RING'
        elif 'belt' in path_str or 'belt' in name_lower:
            return 'CLASS_BELT'
        else:
            return 'CLASS_HELMET'  # Default fallback
    
    def scan_java_files(self):
        """Scan all Java files and extract data"""
        print("🔍 Scanning Java files...")
        
        # Parse modifiers
        print("\n📊 Parsing modifiers...")
        modifier_dirs = self.java_base / 'Item_modifiers'
        for modifier_file in modifier_dirs.rglob('Modifiers_*.java'):
            self.parse_modifiers_file(modifier_file)
        
        # Parse items
        print("\n📦 Parsing items...")
        items_dir = self.java_base / 'Items'
        for item_file in items_dir.rglob('*.java'):
            if item_file.stem != 'Item_base':
                self.parse_item_file(item_file)
        
        print(f"\n✅ Scan complete!")
        print(f"   - Modifiers: {len(self.modifiers)}")
        print(f"   - Items: {len(self.items)}")
    
    def generate_c_files(self):
        """Generate C header and source files"""
        print("\n🔨 Generating C files...")
        
        # Generate modifiers data
        self.generate_modifiers_data()
        
        # Generate items data
        self.generate_items_data()
        
        # Generate lookup tables
        self.generate_lookup_tables()
        
        print("✅ C files generated successfully!")
    
    def generate_modifiers_data(self):
        """Generate modifiers_data.h and modifiers_data.c with separated arrays and full tier data"""
        output_dir = self.output / 'core'
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Separate modifiers by source
        normal_mods = [m for m in self.modifiers if m['source'] == 'NORMAL']
        desecrated_mods = [m for m in self.modifiers if m['source'] == 'DESECRATED']
        essence_mods = [m for m in self.modifiers if m['source'] == 'ESSENCE']
        perfect_essence_mods = [m for m in self.modifiers if m['source'] == 'PERFECT_ESSENCE']
        
        # Count total tiers
        total_tiers = sum(len(m['tiers']) for m in self.modifiers)
        
        # Source file
        with open(output_dir / 'modifiers_data.c', 'w') as f:
            f.write('#include "modifiers_data.h"\n')
            f.write('#include "tags.h"\n')
            f.write('#include <string.h>\n\n')
            
            # Declare static arrays
            f.write(f'Modifier MODIFIERS_NORMAL[{len(normal_mods)}];\n')
            f.write(f'Modifier MODIFIERS_DESECRATED[{len(desecrated_mods)}];\n')
            f.write(f'Modifier MODIFIERS_ESSENCE[{len(essence_mods)}];\n')
            f.write(f'Modifier MODIFIERS_PERFECT_ESSENCE[{len(perfect_essence_mods)}];\n\n')
            
            # Generate tier data arrays (static, embedded in the file)
            self._generate_tier_arrays(f, 'NORMAL', normal_mods)
            self._generate_tier_arrays(f, 'DESECRATED', desecrated_mods)
            self._generate_tier_arrays(f, 'ESSENCE', essence_mods)
            self._generate_tier_arrays(f, 'PERFECT_ESSENCE', perfect_essence_mods)
            
            # Init function
            f.write('void init_modifiers_data(void) {\n')
            
            # Generate modifiers with tier references
            self._generate_modifier_inits(f, 'NORMAL', normal_mods)
            self._generate_modifier_inits(f, 'DESECRATED', desecrated_mods)
            self._generate_modifier_inits(f, 'ESSENCE', essence_mods)
            self._generate_modifier_inits(f, 'PERFECT_ESSENCE', perfect_essence_mods)
            
            f.write('}\n\n')
            
            # Helper function
            f.write('Modifier* get_modifier(ModifierSource source, int index) {\n')
            f.write('    switch(source) {\n')
            f.write('        case SOURCE_NORMAL:\n')
            f.write('            return (index < MODIFIERS_NORMAL_COUNT) ? &MODIFIERS_NORMAL[index] : NULL;\n')
            f.write('        case SOURCE_DESECRATED:\n')
            f.write('            return (index < MODIFIERS_DESECRATED_COUNT) ? &MODIFIERS_DESECRATED[index] : NULL;\n')
            f.write('        case SOURCE_ESSENCE:\n')
            f.write('            return (index < MODIFIERS_ESSENCE_COUNT) ? &MODIFIERS_ESSENCE[index] : NULL;\n')
            f.write('        case SOURCE_PERFECT_ESSENCE:\n')
            f.write('            return (index < MODIFIERS_PERFECT_ESSENCE_COUNT) ? &MODIFIERS_PERFECT_ESSENCE[index] : NULL;\n')
            f.write('        default:\n')
            f.write('            return NULL;\n')
            f.write('    }\n')
            f.write('}\n')
        
        mods_with_tiers = sum(1 for m in self.modifiers if m['tiers'])
        print(f"  ✓ Generated modifiers_data.c (separated by source)")
        print(f"    - NORMAL: {len(normal_mods)} modifiers")
        print(f"    - DESECRATED: {len(desecrated_mods)} modifiers")
        print(f"    - ESSENCE: {len(essence_mods)} modifiers")
        print(f"    - PERFECT_ESSENCE: {len(perfect_essence_mods)} modifiers")
        print(f"    - Total: {len(self.modifiers)} ({mods_with_tiers} with {total_tiers} tiers)")
    
    def _generate_tier_arrays(self, f, source_name, mods):
        """Generate static tier data arrays for a source"""
        if not mods:
            return
        
        f.write(f'// {source_name} tier data\n')
        for i, mod in enumerate(mods):
            if mod['tiers']:
                f.write(f'static ModifierTierData tiers_{source_name.lower()}_{i}[] = {{\n')
                for tier in mod['tiers']:
                    f.write(f'    {{\n')
                    f.write(f'        .tier_name = "{tier["name"][:31]}",\n')
                    f.write(f'        .level_req = {tier["level"]},\n')
                    f.write(f'        .weight = {tier["weight"]},\n')
                    f.write(f'        .value_count = {len(tier["values"])},\n')
                    f.write(f'        .values = {{\n')
                    for value in tier['values']:
                        f.write(f'            {{.min = {value["min"]}, .max = {value["max"]}}},\n')
                    # Pad with zeros if less than 4 values
                    for _ in range(4 - len(tier['values'])):
                        f.write(f'            {{.min = 0, .max = 0}},\n')
                    f.write(f'        }}\n')
                    f.write(f'    }},\n')
                f.write(f'}};\n\n')
        f.write('\n')
    
    def _generate_modifier_inits(self, f, source_name, mods):
        """Generate modifier initialization code for a source"""
        if not mods:
            return
        
        f.write(f'    // {source_name} modifiers\n')
        for i, mod in enumerate(mods):
            f.write(f'    MODIFIERS_{source_name}[{i}] = (Modifier){{\n')
            f.write(f'        .id = {i},\n')
            f.write(f'        .type = MOD_{mod["type"]},\n')
            f.write(f'        .source = SOURCE_{source_name},\n')
            f.write(f'        .tags = {mod["tags_expr"]},\n')
            f.write(f'        .name = "{mod["name"][:127]}",\n')
            f.write(f'        .description = "{mod["description"][:255]}",\n')
            f.write(f'        .tier_count = {len(mod["tiers"])},\n')
            if mod['tiers']:
                f.write(f'        .tiers = tiers_{source_name.lower()}_{i}\n')
            else:
                f.write(f'        .tiers = NULL\n')
            f.write(f'    }};\n')
        f.write('\n')
    
    def generate_items_data(self):
        """Generate items_data.h and items_data.c"""
        output_dir = self.output / 'core'
        
        # Header
        with open(output_dir / 'items_data.h', 'w') as f:
            f.write('#ifndef ITEMS_DATA_H\n')
            f.write('#define ITEMS_DATA_H\n\n')
            f.write('#include "items.h"\n\n')
            f.write(f'#define ITEMS_COUNT {len(self.items)}\n\n')
            f.write('extern Item ITEMS_DB[ITEMS_COUNT];\n\n')
            f.write('void init_items_data(void);\n\n')
            f.write('#endif\n')
        
        # Source
        with open(output_dir / 'items_data.c', 'w') as f:
            f.write('#include "items_data.h"\n')
            f.write('#include <string.h>\n\n')
            f.write(f'Item ITEMS_DB[{len(self.items)}];\n\n')
            f.write('void init_items_data(void) {\n')
            
            for i, item in enumerate(self.items):
                f.write(f'    // {item["class_name"]}\n')
                f.write(f'    ITEMS_DB[{i}] = (Item){{\n')
                f.write(f'        .id = {item["id"]},\n')
                f.write(f'        .item_class = {item["item_class"]},\n')
                f.write(f'        .rarity = RARITY_NORMAL,\n')
                f.write(f'        .level = 1,\n')
                f.write(f'        .item_level = 85,\n')
                f.write(f'        .name = "{item["class_name"][:63]}",\n')
                f.write(f'        .tags = 0\n')
                f.write(f'    }};\n')
                if i < len(self.items) - 1:
                    f.write('\n')
            
            f.write('}\n')
        
        print(f"  ✓ Generated items_data.c ({len(self.items)} items)")
    
    def generate_lookup_tables(self):
        """Generate item-to-modifiers lookup tables with max tier resolution"""
        output_dir = self.output / 'core'
        
        # Create mappings: (var_name, file_path) -> (source, per-source index, tier_count)
        # Separate modifiers by source to get per-source indices
        normal_mods = [m for m in self.modifiers if m['source'] == 'NORMAL']
        desecrated_mods = [m for m in self.modifiers if m['source'] == 'DESECRATED']
        essence_mods = [m for m in self.modifiers if m['source'] == 'ESSENCE']
        perfect_essence_mods = [m for m in self.modifiers if m['source'] == 'PERFECT_ESSENCE']
        
        # Build lookup by (var_name, file_path) for precise matching
        mod_key_to_data = {}
        for idx, mod in enumerate(normal_mods):
            key = (mod['var_name'], mod['file_path'])
            mod_key_to_data[key] = ('NORMAL', idx, len(mod['tiers']))
        for idx, mod in enumerate(desecrated_mods):
            key = (mod['var_name'], mod['file_path'])
            mod_key_to_data[key] = ('DESECRATED', idx, len(mod['tiers']))
        for idx, mod in enumerate(essence_mods):
            key = (mod['var_name'], mod['file_path'])
            mod_key_to_data[key] = ('ESSENCE', idx, len(mod['tiers']))
        for idx, mod in enumerate(perfect_essence_mods):
            key = (mod['var_name'], mod['file_path'])
            mod_key_to_data[key] = ('PERFECT_ESSENCE', idx, len(mod['tiers']))
        
        # Also create fallback by var_name only (for cases without imports)
        mod_varname_to_candidates = {}
        for mod in self.modifiers:
            if mod['var_name'] not in mod_varname_to_candidates:
                mod_varname_to_candidates[mod['var_name']] = []
            mod_varname_to_candidates[mod['var_name']].append(mod)
        
        with open(output_dir / 'item_mod_lookup.h', 'w') as f:
            f.write('#ifndef ITEM_MOD_LOOKUP_H\n')
            f.write('#define ITEM_MOD_LOOKUP_H\n\n')
            f.write('#include <stdint.h>\n')
            f.write('#include "modifiers.h"\n\n')
            f.write('// Lookup entry: source, per-source index, and max tier limit\n')
            f.write('typedef struct {\n')
            f.write('    ModifierSource source;\n')
            f.write('    uint16_t index;\n')
            f.write('    uint8_t max_tier_index;  // Max tier index accessible (0-based), 255 = all tiers\n')
            f.write('} ModifierLookup;\n\n')
            
            for item in self.items:
                class_lower = item['class_name'].lower()
                
                # Declare arrays
                for mod_type in ['normal_prefixes', 'normal_suffixes', 
                                 'desecrated_prefixes', 'desecrated_suffixes',
                                 'essence_prefixes', 'essence_suffixes']:
                    if item['allowed_mods'][mod_type]:
                        count = len(item['allowed_mods'][mod_type])
                        f.write(f'extern ModifierLookup {class_lower}_{mod_type}[{count}];\n')
            
            f.write('\n#endif\n')
        
        with open(output_dir / 'item_mod_lookup.c', 'w') as f:
            f.write('#include "item_mod_lookup.h"\n\n')
            f.write('// Lookup tables: item -> (source, per-source index, max_tier) tuples\n')
            f.write('// max_tier_index limits which tiers can roll (0-based, 255 = no limit)\n\n')
            
            for item in self.items:
                class_lower = item['class_name'].lower()
                import_path = item.get('import_map', {}).get('Item_modifiers', '')
                
                for mod_type, mod_list in item['allowed_mods'].items():
                    if not mod_list:
                        continue
                    
                    # Determine which source this mod_type uses
                    if 'normal' in mod_type:
                        source_suffix = 'Normal'
                    elif 'desecrated' in mod_type:
                        source_suffix = 'Desecrated'
                    elif 'essence' in mod_type:
                        source_suffix = 'Essences'
                    else:
                        source_suffix = 'Normal'
                    
                    f.write(f'// {item["class_name"]} - {mod_type}\n')
                    f.write(f'ModifierLookup {class_lower}_{mod_type}[{len(mod_list)}] = {{\n')
                    
                    # Map var names to (source, index, max_tier) tuples
                    entries = []
                    for var_name in mod_list:
                        # Try to resolve using import path
                        resolved = False
                        if import_path:
                            # Construct expected file path
                            expected_path = f"Item_modifiers/{import_path}/Modifiers_{source_suffix.lower()}.java"
                            key = (var_name, expected_path)
                            if key in mod_key_to_data:
                                source, idx, tier_count = mod_key_to_data[key]
                                max_tier = tier_count - 1 if tier_count > 0 else 0
                                entries.append(f'    {{SOURCE_{source}, {idx}, {max_tier}}}')
                                resolved = True
                        
                        # Fallback: find the modifier with the most tiers (assumed to be the "canonical" one)
                        if not resolved:
                            candidates = mod_varname_to_candidates.get(var_name, [])
                            if candidates:
                                # Pick the one with most tiers as the canonical modifier
                                best = max(candidates, key=lambda m: len(m['tiers']))
                                source = best['source']
                                # Find its index in the source array
                                source_mods = {
                                    'NORMAL': normal_mods,
                                    'DESECRATED': desecrated_mods,
                                    'ESSENCE': essence_mods,
                                    'PERFECT_ESSENCE': perfect_essence_mods
                                }[source]
                                idx = next(i for i, m in enumerate(source_mods) if m['id'] == best['id'])
                                tier_count = len(best['tiers'])
                                max_tier = tier_count - 1 if tier_count > 0 else 0
                                entries.append(f'    {{SOURCE_{source}, {idx}, {max_tier}}}  /* FALLBACK: using max tiers */')
                                resolved = True
                        
                        if not resolved:
                            # Not found at all
                            entries.append(f'    {{SOURCE_NORMAL, 9999, 0}} /* {var_name} NOT FOUND */')
                    
                    f.write(',\n'.join(entries))
                    f.write('\n};\n\n')
        
        print(f"  ✓ Generated item_mod_lookup.c with per-source indices and max tiers")


def main():
    import sys
    
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    java_base = project_root / 'src' / 'main' / 'java' / 'core'
    output_path = project_root / 'wasm'
    
    print("=" * 60)
    print("POE2 Java to C Database Converter")
    print("=" * 60)
    
    converter = JavaToCConverter(str(java_base), str(output_path))
    converter.scan_java_files()
    converter.generate_c_files()
    
    print("\n" + "=" * 60)
    print("✅ Conversion complete!")
    print(f"📁 Output: {output_path / 'core'}")
    print("=" * 60)

if __name__ == '__main__':
    main()
