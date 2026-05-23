import { StyleSheet } from "react-native";
import { CustomText } from "./CustomText";

const HeaderText = () => {
  return (
    <>
      <CustomText style={styles.connect}>
        {" "}
        <CustomText variant="bold" style={styles.event}>
          EVENT{" "}
        </CustomText>
        CONNECT
      </CustomText>
    </>
  );
};
const styles = StyleSheet.create({
  event: {
    color: "#ffffff",
  },
  connect: {
    fontSize: 24,
    color: "#ffffff",
  },
});
export default HeaderText;
