declare module 'react-native-web' {
  import { ComponentType } from 'react';

  export interface ViewProps {
    className?: string;
    style?: any;
    children?: React.ReactNode;
  }

  export interface TextProps {
    className?: string;
    style?: any;
    children?: React.ReactNode;
  }

  export interface TouchableOpacityProps {
    className?: string;
    style?: any;
    onPress?: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
  }

  export interface ScrollViewProps {
    className?: string;
    style?: any;
    children?: React.ReactNode;
  }

  export interface TextInputProps {
    className?: string;
    style?: any;
    placeholder?: string;
    placeholderTextColor?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  }

  export const View: ComponentType<ViewProps>;
  export const Text: ComponentType<TextProps>;
  export const TouchableOpacity: ComponentType<TouchableOpacityProps>;
  export const ScrollView: ComponentType<ScrollViewProps>;
  export const TextInput: ComponentType<TextInputProps>;
}