package core.metrics;

/**
 * MBean interface for CraftingMetrics
 */
public interface CraftingMetricsMBean {
    long getSimulationsStarted();
    long getSimulationsCompleted();
    long getSimulationsFailed();
    long getActiveSimulations();
}
