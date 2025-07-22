import { View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function CameraStream() {
  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={['*']}
        source={{
          html: `
            <html>
              <body style="margin:0;padding:0;">
                <h1>Hello VietNam</h1>
              </body>
            </html>
          `
        }}
        javaScriptEnabled
        onError={(e) => console.error("Lỗi WebView:", e.nativeEvent)}
        style={{ flex: 1 }}
      />
    </View>
  );
}
