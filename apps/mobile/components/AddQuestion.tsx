import { StyleSheet, Text, TextInput, View } from "react-native";

const styles = StyleSheet.create({
    dynamicQuestionBox: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
    },
    questionHeader: {
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    input: {
        height: 40,
        fontSize: 14,
        color: '#333',
    },
});

export default function AddQuestion(){
    return (
        <View style={styles.dynamicQuestionBox}>
            <View style={styles.questionHeader}>
                <Text style={styles.label}>Nhập câu hỏi</Text>
            </View>
            <View style={styles.inputWrapper}>
                <TextInput 
                    style={styles.input} 
                    placeholder="Nhập nội dung câu hỏi (VD: Bạn cần hỗ trợ gì không?)" 
                    placeholderTextColor="#bbb" 
                />
            </View>
        </View>
    )
}