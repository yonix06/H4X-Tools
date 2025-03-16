import 'react-native-web';

declare module 'react-native-web' {
  import { ComponentType } from 'react';

  interface BaseProps {
    className?: string;
    style?: any;
    children?: React.ReactNode;
  }

  export interface ViewProps extends BaseProps {
    onLayout?: (event: { nativeEvent: { layout: { x: number; y: number; width: number; height: number } } }) => void;
  }

  export interface TextProps extends BaseProps {
    onPress?: () => void;
    selectable?: boolean;
  }

  export interface TouchableOpacityProps extends BaseProps {
    onPress?: () => void;
    disabled?: boolean;
    activeOpacity?: number;
  }

  export interface ScrollViewProps extends BaseProps {
    horizontal?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    showsVerticalScrollIndicator?: boolean;
    contentContainerStyle?: any;
    onScroll?: (event: any) => void;
    scrollEventThrottle?: number;
  }

  export interface TextInputProps extends BaseProps {
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
    gap?: number | string;
    marginTop?: number | string;
    marginBottom?: number | string;
    marginLeft?: number | string;
    marginRight?: number | string;
    padding?: number | string;
    paddingTop?: number | string;
    paddingBottom?: number | string;
    paddingLeft?: number | string;
    paddingRight?: number | string;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    flex?: number;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: number | string;
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    backgroundColor?: string;
    borderRadius?: number | string;
    borderWidth?: number;
    borderColor?: string;
    width?: number | string;
    height?: number | string;
    position?: 'absolute' | 'relative';
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
    zIndex?: number;
  }

  export interface TextStyle {
    fontSize?: number | string;
    fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    color?: string;
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through';
    fontStyle?: 'normal' | 'italic';
    lineHeight?: number | string;
    letterSpacing?: number | string;
    whiteSpace?: string;
  }

  export const View: ComponentType<ViewProps>;
  export const Text: ComponentType<TextProps>;
  export const TouchableOpacity: ComponentType<TouchableOpacityProps>;
  export const ScrollView: ComponentType<ScrollViewProps>;
  export const TextInput: ComponentType<TextInputProps>;
}