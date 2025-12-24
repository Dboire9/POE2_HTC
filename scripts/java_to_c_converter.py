#!/usr/bin/env python3
"""
Java to C Database Converter
Converts POE2 Java item and modifier classes to C structs and data arrays
"""

import os
import re
import json
from pathlib import Path
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
        
        # Find all Pair<>(...) values
        pair_pattern = r'new\s+Pair<>\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)'
        pairs = re.findall(pair_pattern, tier_text)
        
        for min_val, max_val in pairs:
            tier['values'].append({
                'min': int(min_val),
                'max': int(max_val)
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
        
        # Extract primary category (first string)
        category_match = re.search(r'"([^"]+)"', modifier_block)
        primary_category = category_match.group(1) if category_match else var_name.lower()
        
        # Extract tags (List.of("tag1", "tag2"))
        tags_match = re.search(r'List\.of\((.*?)\)', modifier_block)
        tags = []
        if tags_match:
            tag_content = tags_match.group(1)
            tags = re.findall(r'"([^"]+)"', tag_content)
        
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
        
        # Extract family
        family_match = re.search(r'"([^"]+)"\s*,\s*"[^"]*"\s*\)\s*;', modifier_block)
        family = family_match.group(1) if family_match else primary_category
        
        # Extract description text
        text_match = re.findall(r'"([^"]+)"', modifier_block)
        text = text_match[-1] if text_match else var_name.replace('_', ' ')
        
        return {
            'id': self.modifier_id_counter,
            'var_name': var_name,
            'primary_category': primary_category,
            'tags': tags,
            'tiers': tiers,
            'type': mod_type,
            'source': source,
            'family': family,
            'text': text
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
            'allowed_mods': allowed_mods
        }
        
        self.items.append(item)
        self.item_id_counter += 1
        
        total_mods = sum(len(mods) for mods in allowed_mods.values())
        print(f"  ✓ Parsed item: {class_name} ({total_mods} mods)")
    
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
        """Generate modifiers_data.h and modifiers_data.c"""
        output_dir = self.output / 'core'
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Header file
        with open(output_dir / 'modifiers_data.h', 'w') as f:
            f.write('#ifndef MODIFIERS_DATA_H\n')
            f.write('#define MODIFIERS_DATA_H\n\n')
            f.write('#include "modifiers.h"\n\n')
            f.write(f'#define MODIFIERS_COUNT {len(self.modifiers)}\n\n')
            f.write('extern Modifier MODIFIERS_DB[MODIFIERS_COUNT];\n\n')
            f.write('void init_modifiers_data(void);\n\n')
            f.write('#endif\n')
        
        # Source file
        with open(output_dir / 'modifiers_data.c', 'w') as f:
            f.write('#include "modifiers_data.h"\n')
            f.write('#include <string.h>\n\n')
            f.write(f'Modifier MODIFIERS_DB[{len(self.modifiers)}];\n\n')
            f.write('void init_modifiers_data(void) {\n')
            
            mods_with_tiers = 0
            total_tiers = 0
            
            for i, mod in enumerate(self.modifiers):
                tier = mod['tiers'][0] if mod['tiers'] else None
                f.write(f'    // {mod["var_name"]} - {len(mod["tiers"])} tiers\n')
                f.write(f'    MODIFIERS_DB[{i}] = (Modifier){{\n')
                f.write(f'        .id = {mod["id"]},\n')
                f.write(f'        .type = MOD_{mod["type"]},\n')
                f.write(f'        .tier = TIER_1,\n')
                f.write(f'        .weight = {tier["weight"] if tier else 1000},\n')
                f.write(f'        .level_req = {tier["level"] if tier else 1},\n')
                f.write(f'        .tags = 0,\n')
                f.write(f'        .name = "{mod["text"][:63]}",\n')
                f.write(f'        .description = "{mod["text"][:127]}"\n')
                f.write(f'    }};\n')
                
                if mod['tiers']:
                    mods_with_tiers += 1
                    total_tiers += len(mod['tiers'])
                
                if i < len(self.modifiers) - 1:
                    f.write('\n')
            
            f.write('}\n')
        
        print(f"  ✓ Generated modifiers_data.c ({len(self.modifiers)} modifiers)")
        print(f"    - {mods_with_tiers} with tiers ({total_tiers} total tiers)")
        print(f"    - {len(self.modifiers) - mods_with_tiers} without tiers")
    
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
                f.write(f'        .item_class = CLASS_UNKNOWN,\n')
                f.write(f'        .rarity = RARITY_RARE,\n')
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
        """Generate item-to-modifiers lookup tables"""
        output_dir = self.output / 'core'
        
        # Build modifier var_name -> id mapping
        mod_name_to_id = {mod['var_name']: mod['id'] for mod in self.modifiers}
        
        with open(output_dir / 'item_mod_lookup.h', 'w') as f:
            f.write('#ifndef ITEM_MOD_LOOKUP_H\n')
            f.write('#define ITEM_MOD_LOOKUP_H\n\n')
            f.write('#include <stdint.h>\n\n')
            
            for item in self.items:
                class_lower = item['class_name'].lower()
                
                # Declare arrays
                for mod_type in ['normal_prefixes', 'normal_suffixes', 
                                 'desecrated_prefixes', 'desecrated_suffixes',
                                 'essence_prefixes', 'essence_suffixes']:
                    if item['allowed_mods'][mod_type]:
                        count = len(item['allowed_mods'][mod_type])
                        f.write(f'extern uint16_t {class_lower}_{mod_type}[{count}];\n')
            
            f.write('\n#endif\n')
        
        with open(output_dir / 'item_mod_lookup.c', 'w') as f:
            f.write('#include "item_mod_lookup.h"\n\n')
            f.write('// Lookup tables: item -> allowed modifier IDs\n\n')
            
            for item in self.items:
                class_lower = item['class_name'].lower()
                
                for mod_type, mod_list in item['allowed_mods'].items():
                    if not mod_list:
                        continue
                    
                    f.write(f'// {item["class_name"]} - {mod_type}\n')
                    f.write(f'uint16_t {class_lower}_{mod_type}[{len(mod_list)}] = {{\n    ')
                    
                    # Map var names to IDs
                    ids = []
                    for var_name in mod_list:
                        mod_id = mod_name_to_id.get(var_name)
                        if mod_id is not None:
                            ids.append(str(mod_id))
                        else:
                            # Not found, use placeholder
                            ids.append(f'9999 /* {var_name} NOT FOUND */')
                    
                    f.write(', '.join(ids))
                    f.write('\n};\n\n')
        
        print(f"  ✓ Generated item_mod_lookup.c with mappings")

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
