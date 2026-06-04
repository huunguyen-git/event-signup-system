import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { CustomText } from "@/components/CustomText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { getToken, removeToken, removeUserRole, removeUserId, saveUserRole, getUserRole } from "@/services/storage";
import { UserService } from "../../../axios/userService";
import { AuthService } from "../../../axios/authService";
import { ClubRequestService } from "../../../axios/clubRequestService";
import Header from "@/components/Header";

type User = {
  full_name: string;
  email: string;
  phone_number: string | null;
  description: string | null;
  birthdate: string;
  avatar_url: string | null;
  created_at: string;
  role: string;
};

const AccountScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [clubRequest, setClubRequest] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [clubName, setClubName] = useState("");
  const [clubDesc, setClubDesc] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        try {
          const token = await getToken();
          if (!token) {
            router.replace("/LoginScreen");
            return;
          }
          const data = await UserService.getMe(token);
          
          // Check role transition
          const oldRole = await getUserRole();
          await saveUserRole(data.role);
          if (oldRole === "STUDENT" && data.role === "CLUB") {
            Alert.alert(
              "Tài khoản được duyệt",
              "Tài khoản của bạn đã được nâng cấp lên CLB thành công! Vui lòng khởi động lại ứng dụng để cập nhật chức năng mới.",
              [{ text: "Đã hiểu" }]
            );
          }

          setUser(data);

          if (data.role === "STUDENT") {
            const reqData = await ClubRequestService.getMyRequest(token);
            setClubRequest(reqData);
          }
        } catch (e: any) {
          console.log("Error loading profile:", e);
          if (e.response?.status === 401) {
            Alert.alert("Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại.", [
              {
                text: "Đăng nhập",
                onPress: async () => {
                  await removeToken();
                  router.replace("/LoginScreen");
                },
              },
            ]);
          } else {
            Alert.alert("Error", "Failed to load profile");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }, []),
  );
  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken();
            if (token != null) {
              await AuthService.logout(token);
            }
          } catch (e) {
            Alert.alert("Error", "Failed to log out");
          } finally {
            await removeToken();
            await removeUserId();
            await removeUserRole();
            router.replace("/LoginScreen");
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmitClubRequest = async () => {
    if (!clubName.trim() || !clubDesc.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tên CLB và lý do đăng ký.");
      return;
    }

    try {
      setSubmittingRequest(true);
      const token = await getToken();
      if (!token) return;

      await ClubRequestService.submitRequest(token, {
        club_name: clubName,
        description: clubDesc,
      });

      Alert.alert("Thành công", "Đơn đăng ký đã được gửi thành công và đang chờ xét duyệt!");
      setModalVisible(false);
      setClubName("");
      setClubDesc("");
      
      const reqData = await ClubRequestService.getMyRequest(token);
      setClubRequest(reqData);
    } catch (err: any) {
      console.log("Error submitting club request:", err);
      Alert.alert("Lỗi", err.response?.data?.message || "Gửi đơn đăng ký thất bại.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <Header />

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
        >
          {loading ? (
            <ActivityIndicator
              size="large"
              color={Colors.color.primary}
              style={styles.loader}
            />
          ) : (
            <>
              {/* Avatar + Name */}
              <View style={styles.profileInfo}>
                <View style={styles.avatarContainer}>
                  {user?.avatar_url ? (
                    <Image
                      source={{ uri: user.avatar_url }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <CustomText variant="bold" style={styles.avatarInitial}>
                        {user?.full_name?.charAt(0).toUpperCase() ?? "?"}
                      </CustomText>
                    </View>
                  )}
                </View>
                <CustomText variant="bold" style={styles.profileName}>
                  {user?.full_name}
                </CustomText>
                <CustomText style={styles.profileEmail}>
                  {user?.email}
                </CustomText>
              </View>

              {/* Info Cards */}
              <View style={styles.infoCard}>
                <InfoRow
                  icon="phone-outline"
                  label="Phone"
                  value={user?.phone_number ?? "Not set"}
                />
                <InfoRow
                  icon="calendar-outline"
                  label="Birthdate"
                  value={user?.birthdate ? formatDate(user.birthdate) : "-"}
                />
                <InfoRow
                  icon="clock-outline"
                  label="Member since"
                  value={user?.created_at ? formatDate(user.created_at) : "-"}
                />
                <InfoRow
                  icon="card-text-outline"
                  label="Description"
                  value={user?.description ?? ""}
                  alignTop={true}
                />
              </View>

              {/* Club Request Card */}
              {user?.role === "STUDENT" && (
                <>
                  {!clubRequest && (
                    <View style={styles.clubRequestCard}>
                      <MaterialCommunityIcons name="account-group-outline" size={28} color={Colors.color.primary} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <CustomText variant="bold" style={styles.clubTitle}>Nâng Cấp Tài Khoản CLB</CustomText>
                        <CustomText style={styles.clubDesc}>Đăng ký nâng cấp tài khoản của bạn để có quyền tạo và tổ chức sự kiện.</CustomText>
                      </View>
                      <TouchableOpacity style={styles.clubSubmitBtn} onPress={() => setModalVisible(true)}>
                        <CustomText variant="medium" style={styles.clubSubmitBtnText}>Đăng ký</CustomText>
                      </TouchableOpacity>
                    </View>
                  )}

                  {clubRequest?.status === "PENDING" && (
                    <View style={[styles.clubRequestCard, styles.cardPending]}>
                      <MaterialCommunityIcons name="clock-outline" size={28} color="#B06000" />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <CustomText variant="bold" style={[styles.clubTitle, { color: "#B06000" }]}>Đang Chờ Duyệt</CustomText>
                        <CustomText style={styles.clubDesc}>Yêu cầu đăng ký CLB "{clubRequest.club_name}" đang chờ Nhà trường phê duyệt.</CustomText>
                      </View>
                    </View>
                  )}

                  {clubRequest?.status === "REJECTED" && (
                    <View style={[styles.clubRequestCard, styles.cardRejected]}>
                      <MaterialCommunityIcons name="alert-circle-outline" size={28} color="#EF4444" />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <CustomText variant="bold" style={[styles.clubTitle, { color: "#EF4444" }]}>Yêu Cầu Bị Từ Chối</CustomText>
                        <CustomText style={styles.clubDesc}>Đăng ký CLB "{clubRequest.club_name}" bị từ chối. Nhấp gửi lại để chỉnh sửa đơn.</CustomText>
                      </View>
                      <TouchableOpacity style={styles.clubReSubmitBtn} onPress={() => setModalVisible(true)}>
                        <CustomText variant="medium" style={styles.clubReSubmitBtnText}>Gửi lại</CustomText>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              {/* Buttons */}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push("/(attendee)/EditProfileScreen")}
              >
                <MaterialCommunityIcons
                  name="account-edit-outline"
                  size={20}
                  color={Colors.color.white}
                />
                <CustomText variant="medium" style={styles.editButtonText}>
                  Edit Profile
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changePasswordButton}
                onPress={() => router.push("/(attendee)/ChangePasswordScreen" as any)}
              >
                <MaterialCommunityIcons
                  name="lock-reset"
                  size={20}
                  color={Colors.color.primary}
                />
                <CustomText variant="medium" style={styles.changePasswordButtonText}>
                  Change Password
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={20}
                  color={Colors.color.primary}
                />
                <CustomText variant="medium" style={styles.logoutButtonText}>
                  Log Out
                </CustomText>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Club Request Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ width: "100%", alignItems: "center" }}
            >
              <View style={styles.modalCard}>
                <CustomText variant="bold" style={styles.modalTitle}>
                  Đăng Ký Tài Khoản CLB
                </CustomText>
                <CustomText style={styles.modalSub}>
                  Vui lòng nhập tên câu lạc bộ và mô tả hoạt động/lý do muốn nâng cấp tài khoản.
                </CustomText>
                
                <View style={styles.modalInputGroup}>
                  <CustomText variant="bold" style={styles.modalInputLabel}>Tên CLB/Đội</CustomText>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Nhập tên chính thức của CLB..."
                    placeholderTextColor="#9CA3AF"
                    value={clubName}
                    onChangeText={setClubName}
                  />
                </View>

                <View style={styles.modalInputGroup}>
                  <CustomText variant="bold" style={styles.modalInputLabel}>Mô tả / Lý do</CustomText>
                  <TextInput
                    style={[styles.modalInput, styles.modalTextarea]}
                    placeholder="Mô tả tóm tắt hoạt động hoặc lý do..."
                    placeholderTextColor="#9CA3AF"
                    value={clubDesc}
                    onChangeText={setClubDesc}
                    multiline
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => {
                      setModalVisible(false);
                      setClubName("");
                      setClubDesc("");
                    }}
                    disabled={submittingRequest}
                  >
                    <CustomText variant="bold" style={styles.modalCancelText}>Hủy</CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalConfirmBtn}
                    onPress={handleSubmitClubRequest}
                    disabled={submittingRequest}
                  >
                    {submittingRequest ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <CustomText variant="bold" style={styles.modalConfirmText}>Gửi Đơn</CustomText>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

// Small helper component for info rows
const InfoRow = ({
  icon,
  label,
  value,
  alignTop = false,
}: {
  icon: any;
  label: string;
  value: string;
  alignTop?: boolean;
}) => (
  <View style={[styles.infoRow, alignTop && { alignItems: "flex-start" }]}>
    <MaterialCommunityIcons
      name={icon}
      size={22}
      color={Colors.color.primary}
      style={alignTop ? { marginTop: 2 } : null}
    />
    <View style={styles.infoTextContainer}>
      <CustomText style={styles.infoLabel}>{label}</CustomText>
      <CustomText variant="medium" style={styles.infoValue}>
        {value}
      </CustomText>
    </View>
  </View>
);

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color.white,
  },
  header: {
    height: 60,
    alignItems: "center",
    backgroundColor: Colors.color.primary,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 10,
  },
  connect: {
    fontSize: 18,
    color: Colors.color.white,
  },
  event: {},
  Icon: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginLeft: "auto",
  },
  body: {
    flex: 1,
    backgroundColor: Colors.color.background,
  },
  bodyContent: {
    padding: 16,
    alignItems: "center",
  },
  loader: {
    marginTop: 60,
  },
  profileInfo: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  profileImage: {
    height: 100,
    width: 100,
    borderRadius: 50,
  },
  avatarFallback: {
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: Colors.color.lightblue,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 40,
    color: Colors.color.primary,
  },
  profileName: {
    fontSize: 24,
    color: Colors.color.text,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.color.placeholder,
    marginTop: 4,
  },
  infoCard: {
    width: "100%",
    backgroundColor: Colors.color.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.color.placeholder,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.color.text,
  },
  editButton: {
    width: "100%",
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.color.primary,
    borderRadius: 27,
    gap: 8,
    marginBottom: 12,
    shadowColor: Colors.color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  editButtonText: {
    color: Colors.color.white,
    fontSize: 16,
  },
  logoutButton: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.color.primary,
    borderRadius: 30,
    gap: 8,
  },
  logoutButtonText: {
    color: Colors.color.primary,
    fontSize: 16,
  },
  changePasswordButton: {
    width: "100%",
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F4F8",
    borderWidth: 1,
    borderColor: "#D0DCE7",
    borderRadius: 27,
    gap: 8,
    marginBottom: 12,
  },
  changePasswordButtonText: {
    color: Colors.color.primary,
    fontSize: 16,
  },
  clubRequestCard: {
    width: "100%",
    backgroundColor: "#EBF5FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  cardPending: {
    backgroundColor: "#FEF7E0",
    borderColor: "#FED7AA",
  },
  cardRejected: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  clubTitle: {
    fontSize: 16,
    color: Colors.color.primary,
    marginBottom: 4,
  },
  clubDesc: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 16,
  },
  clubSubmitBtn: {
    backgroundColor: Colors.color.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clubSubmitBtnText: {
    color: Colors.color.white,
    fontSize: 12,
  },
  clubReSubmitBtn: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clubReSubmitBtnText: {
    color: Colors.color.white,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: "#1B2B52",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSub: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  modalInputGroup: {
    width: "100%",
    marginBottom: 14,
  },
  modalInputLabel: {
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    color: "#1F2937",
    fontSize: 14,
  },
  modalTextarea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    color: "#4B5563",
    fontSize: 14,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.color.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});
