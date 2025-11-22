#!/bin/bash
# Check if modifiers appear in multiple lists

cat << 'JAVA' | mvn -q exec:java -Dexec.mainClass="jdk.jshell.JShell" 2>/dev/null || \
java -cp "target/classes:$(find ~/.m2/repository -name '*.jar' -type f | tr '\n' ':')" << 'JAVA_INLINE'

import core.Items.Bows.Bows;
import core.Modifier_class.Modifier;
import java.util.*;

Bows bow = new Bows();

List<Modifier> normalPrefixes = bow.getNormalAllowedPrefixes();
List<Modifier> essencePrefixes = bow.getEssencesAllowedPrefixes();

System.out.println("=== Checking 'Adds # to # Physical Damage' ===");

for (Modifier m : normalPrefixes) {
    if (m.text.equals("Adds # to # Physical Damage")) {
        System.out.println("NORMAL: " + m.text + " - Tiers: " + m.tiers.size());
        for (int i = 0; i < m.tiers.size(); i++) {
            System.out.println("  Tier " + i + ": " + m.tiers.get(i).name);
        }
    }
}

for (Modifier m : essencePrefixes) {
    if (m.text.equals("Adds # to # Physical Damage")) {
        System.out.println("ESSENCE: " + m.text + " - Tiers: " + m.tiers.size());
        for (int i = 0; i < m.tiers.size(); i++) {
            System.out.println("  Tier " + i + ": " + m.tiers.get(i).name);
        }
    }
}

JAVA_INLINE
