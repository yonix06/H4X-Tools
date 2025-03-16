import 'react-native-web';

declare module 'react-native-web' {
  import { ComponentType } from 'react';

  export interface ViewProps {
    className?: string;
    style?: any;
    children?: React.ReactNode;
    onLayout?: (event: { nativeEvent: { layout: { x: number; y: number; width: number; height: number } } }) => void;
  }

  export interface TextProps {
    className?: string;
    style?: any;
    children?: React.ReactNode;
    onPress?: () => void;
  }

  export interface TouchableOpacityProps {
    className?: string;
    style?: any;
    onPress?: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
    activeOpacity?: number;
  }

  export interface ScrollViewProps {
    className?: string;
    style?: any;
    children?: React.ReactNode;
    horizontal?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    showsVerticalScrollIndicator?: boolean;
    contentContainerStyle?: any;
    onScroll?: (event: any) => void;
    scrollEventThrottle?: number;
  }

  export interface TextInputProps {
    className?: string;
    style?: any;
    placeholder?: string;
    placeholderTextColor?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onChange?: (e: { nativeEvent: { text: string } }) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    multiline?: boolean;
    numberOfLines?: number;
    textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    autoFocus?: boolean;
    editable?: boolean;
    maxLength?: number;
  }

  export interface ViewStyle {
    maxHeight?: number | string;
    gap?: number;
  }

  export interface TextStyle {
    whiteSpace?: string;
  }

  export const View: ComponentType<ViewProps>;
  export const Text: ComponentType<TextProps>;
  export const TouchableOpacity: ComponentType<TouchableOpacityProps>;
  export const ScrollView: ComponentType<ScrollViewProps>;
  export const TextInput: ComponentType<TextInputProps>;
}