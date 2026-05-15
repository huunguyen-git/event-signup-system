import { Redirect } from "expo-router";

export default function Index() {
  // Tạm thời chuyển thẳng vào màn hình Scan QR để bạn test Camera
  return <Redirect href="/(Auth)/LoginScreen" />;

  // Sau này khi test xong Camera, bạn mở comment dòng dưới để app chạy vào màn hình Login chuẩn luồng của Event Connect nhé:
  // return <Redirect href="/(Auth)/LoginScreen" />;
}
