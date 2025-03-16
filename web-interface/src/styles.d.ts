import 'react-native-web';

declare module 'react-native-web' {
  interface ViewStyle {
    maxHeight?: number | string;
  }

  interface TextStyle {
    whiteSpace?: string;
  }
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}