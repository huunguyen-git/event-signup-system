import { StyleSheet, View } from "react-native";
import { CustomText } from "@/components/CustomText";

interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  trend?: string;
  progress?: number;
  isChart?: boolean;
}

const StatCard = ({
  title,
  value,
  subtext,
  trend,
  progress,
  isChart,
}: StatCardProps) => {
  return (
    <View style={styles.statCard}>
      <CustomText variant="bold" style={styles.statTitle}>{title}</CustomText>

      <View style={styles.statMain}>
        <CustomText variant="bold" style={styles.statValue}>
          {value}
          {trend && (
            <View style={styles.trendBadge}>
              <CustomText variant="bold" style={styles.trendText}>{trend}</CustomText>
            </View>
          )}
        </CustomText>

        {subtext && (
          <View style={styles.subtextContainer}>
            <CustomText style={styles.subtext}>{subtext}</CustomText>
          </View>
        )}

        {progress && (
          <View style={styles.progressRow}>
            <View style={styles.progressBarBg}>
              <View
                style={[styles.progressBarFill, { width: `${progress}%` }]}
              />
            </View>
          </View>
        )}

        {isChart && (
          <View style={styles.chartPlaceholder}>
            <View style={[styles.bar, { height: 10 }]} />
            <View style={[styles.bar, { height: 18 }]} />
            <View style={[styles.bar, { height: 14 }]} />
            <View
              style={[styles.bar, { height: 22, backgroundColor: "#5D9CEC" }]}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    width: "48%",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statTitle: {
    fontSize: 10,
    color: "#1B2B52",
    opacity: 0.8,
  },
  statMain: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statValue: {
    fontSize: 22,
    color: "#000",
  },
  trendBadge: {
    backgroundColor: "#D4EDDA",
    paddingHorizontal: 4,
    borderRadius: 4,
    marginLeft: 6,
  },
  trendText: {
    color: "#28A745",
    fontSize: 14,
  },
  subtextContainer: {
    backgroundColor: "#E9ECEF",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  subtext: {
    fontSize: 9,
    color: "#6C757D",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#e1e9f4b0",
    borderRadius: 3,
    marginRight: 6,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: "#5D9CEC",
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 9,
    color: "#666",
  },
  chartPlaceholder: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    height: 30,
    marginTop: -10,
    marginLeft: 10,
  },
  bar: {
    width: 4,
    backgroundColor: "#ADC8FF",
    marginHorizontal: 1,
    borderRadius: 1,
  },
});

export default StatCard;
