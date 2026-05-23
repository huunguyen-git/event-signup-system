import { StyleSheet, TextInput, View } from "react-native";
import { CustomText } from "./CustomText";

const styles = StyleSheet.create({
  dynamicQuestionBox: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  questionHeader: {
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    color: "#1B2B52",
  },
  inputWrapper: {
    backgroundColor: "#f4f6f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    height: 45,
    fontSize: 15,
    color: "#333",
  },
});

export default function AddQuestion() {
  return (
    <View style={styles.dynamicQuestionBox}>
      <View style={styles.questionHeader}>
        <CustomText variant="bold" style={styles.label}>
          Nhập câu hỏi
        </CustomText>
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Nhập nội dung câu hỏi (VD: Bạn cần hỗ trợ gì không?)"
          placeholderTextColor="#bbb"
        />
      </View>
    </View>
  );
}
