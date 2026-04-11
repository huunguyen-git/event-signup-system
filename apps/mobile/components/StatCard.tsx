import { StyleSheet, View, Text } from 'react-native';

interface StatCardProps {
    title: string;
    value: string;
    subtext?: string;
    trend?: string;
    progress?: number;
    isChart?: boolean;
}

const StatCard = ({title, value, subtext, trend, progress, isChart}: StatCardProps) => {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statTitle}>
                {title}
            </Text>

            <View style={styles.statMain}>
                <Text style={styles.statValue}>
                    {value}
                    {trend && (
                        <View style={styles.trendBadge}>
                            <Text style={styles.trendText}>
                                {trend}
                            </Text>
                        </View>
                    )}
                </Text>

                {subtext && (
                    <View style={styles.subtextContainer}>
                        <Text style={styles.subtext}>
                            {subtext}
                        </Text>
                    </View>
                )}

                {progress && (
                    <View style={styles.progressRow}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                        </View>
                    </View>
                )}

                {isChart && (
                    <View style={styles.chartPlaceholder}>
                        <View style={[styles.bar, { height: 10 }]} />
                        <View style={[styles.bar, { height: 18 }]} />
                        <View style={[styles.bar, { height: 14 }]} />
                        <View style={[styles.bar, { height: 22, backgroundColor: '#5D9CEC' }]} />
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    // Elevation for Android
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F4F8',
  },
  statTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1B2B52',
    opacity: 0.8,
  },
  statMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  trendBadge: {
    backgroundColor: '#D4EDDA',
    paddingHorizontal: 4,
    borderRadius: 4,
    marginLeft: 6,
  },
  trendText: {
    color: '#28A745',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtextContainer: {
    backgroundColor: '#E9ECEF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  subtext: {
    fontSize: 9,
    color: '#6C757D',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#e1e9f4b0',
    borderRadius: 3,
    marginRight: 6,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#5D9CEC',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666',
  },
  chartPlaceholder: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    height: 30,
    marginTop: -10,
    marginLeft: 10,
  },
  bar: {
    width: 4,
    backgroundColor: '#ADC8FF',
    marginHorizontal: 1,
    borderRadius: 1,
  },
});

export default StatCard;