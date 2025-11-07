package core.Items;

import core.Modifier_class.*;
import java.util.List;

public class Item_base {
    protected List<Modifier> Normal_allowedPrefixes;
    protected List<Modifier> Normal_allowedSuffixes;
    protected List<Modifier> Desecrated_allowedPrefixes;
    protected List<Modifier> Desecrated_allowedSuffixes;
    protected List<Modifier> Essences_allowedPrefixes;
    protected List<Modifier> Essences_allowedSuffixes;


	public List<Modifier> getNormalAllowedPrefixes() {
		return Normal_allowedPrefixes;
	}
	
	public List<Modifier> getNormalAllowedSuffixes() {
		return Normal_allowedSuffixes;
	}
	
	public List<Modifier> getDesecratedAllowedPrefixes() {
		return Desecrated_allowedPrefixes;
	}
	
	public List<Modifier> getDesecratedAllowedSuffixes() {
		return Desecrated_allowedSuffixes;
	}
	
	public List<Modifier> getEssencesAllowedPrefixes() {
		return Essences_allowedPrefixes;
	}
	
	public List<Modifier> getEssencesAllowedSuffixes() {
		return Essences_allowedSuffixes;
	}
}