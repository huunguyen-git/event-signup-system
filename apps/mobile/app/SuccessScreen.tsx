import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/theme";
import { CustomText } from "@/components/CustomText";

export default function SuccessScreen() {
  const router = useRouter();
  const themeColor = Colors.light.tint;

  const { ticketType, eventTitle } = useLocalSearchParams();

  return (
    <View style={styles.overlayContainer}>
      <View style={styles.successCard}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={50} color="#4CAF50" />
        </View>
 
        <CustomText variant="bold" style={styles.mainTitle}>
          REGISTRATION SUCCESSFUL!
        </CustomText>
 
        <CustomText style={styles.description}>
          Thank you for registering for the{" "}
          <CustomText variant="bold">{eventTitle || "International Tech Summit 2024"}</CustomText>
          . Your registration for the{" "}
          <CustomText variant="bold" style={{ color: themeColor }}>
            {ticketType || "Standard Pass"}
          </CustomText>{" "}
          is confirmed.
        </CustomText>

        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <CustomText style={styles.detailLabel}>Order Number:</CustomText>
            <CustomText variant="bold" style={styles.detailValue}>
              ITS-2026-5678
            </CustomText>
          </View>
          <View style={styles.detailRow}>
            <CustomText style={styles.detailLabel}>Pass Type:</CustomText>
            <CustomText variant="bold" style={styles.detailValue}>
              {ticketType || "Standard Pass"}
            </CustomText>
          </View>
          <View style={styles.detailRow}>
            <CustomText style={styles.detailLabel}>Date:</CustomText>
            <CustomText variant="bold" style={styles.detailValue}>
              Oct 12-14, 2026
            </CustomText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace("/DashBoardScreen")}
        >
          <CustomText
            variant="bold"
            style={[styles.secondaryBtnText, { color: "#555" }]}
          >
            GO TO MY DASHBOARD
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 25,
  },
  successCard: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    borderColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 12,
    color: "#333",
  },
  description: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 25,
  },
  detailsBox: {
    width: "100%",
    backgroundColor: "#E9ECEF",
    padding: 18,
    borderRadius: 20,
    marginBottom: 25,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: { color: "#666", fontSize: 13 },
  detailValue: { color: "#000", fontSize: 13 },
  primaryBtn: {
    width: "100%",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryBtnText: { color: "white", fontSize: 15 },
  secondaryBtn: {
    width: "100%",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    backgroundColor: "#F1F3F5",
  },
  secondaryBtnText: { fontSize: 15 },
});
