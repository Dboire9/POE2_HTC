package core.metrics;

import java.util.concurrent.atomic.AtomicLong;

/**
 * Metrics for crafting simulations - exposed via JMX for Prometheus
 */
public class CraftingMetrics implements CraftingMetricsMBean {
    private static final CraftingMetrics INSTANCE = new CraftingMetrics();
    
    private final AtomicLong simulationsStarted = new AtomicLong(0);
    private final AtomicLong simulationsCompleted = new AtomicLong(0);
    private final AtomicLong simulationsFailed = new AtomicLong(0);
    
    private CraftingMetrics() {
        // Register MBean only once
        try {
            javax.management.MBeanServer mbs = java.lang.management.ManagementFactory.getPlatformMBeanServer();
            javax.management.ObjectName name = new javax.management.ObjectName("core.metrics:type=CraftingMetrics");
            // Only register if not already registered
            if (!mbs.isRegistered(name)) {
                mbs.registerMBean(this, name);
            }
        } catch (Exception e) {
            System.err.println("Failed to register CraftingMetrics MBean: " + e.getMessage());
        }
    }
    
    public static CraftingMetrics getInstance() {
        return INSTANCE;
    }
    
    public void recordSimulationStarted() {
        simulationsStarted.incrementAndGet();
    }
    
    public void recordSimulationCompleted() {
        simulationsCompleted.incrementAndGet();
    }
    
    public void recordSimulationFailed() {
        simulationsFailed.incrementAndGet();
    }
    
    @Override
    public long getSimulationsStarted() {
        return simulationsStarted.get();
    }
    
    @Override
    public long getSimulationsCompleted() {
        return simulationsCompleted.get();
    }
    
    @Override
    public long getSimulationsFailed() {
        return simulationsFailed.get();
    }
    
    @Override
    public long getActiveSimulations() {
        return simulationsStarted.get() - simulationsCompleted.get() - simulationsFailed.get();
    }
}
