import 'react-native-web';

declare module 'react-native-web' {
  export interface ScrollViewProps {
    horizontal?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    contentContainerStyle?: any;
    style?: any;
    children?: React.ReactNode;
  }

  export interface TextInputProps {
    onChangeText?: (text: string) => void;
    onChange?: (e: { nativeEvent: { text: string } }) => void;
    secureTextEntry?: boolean;
    placeholder?: string;
    placeholderTextColor?: string;
    style?: any;
    value?: string;
  }

  export interface ViewStyle {
    maxHeight?: number | string;
    gap?: number;
  }

  export interface TextStyle {
    whiteSpace?: string;
  }
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}