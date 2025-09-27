import React from 'react';
import { Pressable, Text, View, ViewProps, PressableProps } from 'react-native';
import { colors } from '@/theme/tokens';

export const Card: React.FC<ViewProps & { trophy?: boolean }> = ({ style, children, trophy, ...rest }) => (
  <View
    style={[{
      backgroundColor: colors.slate,
      borderColor: colors.steel,
      borderWidth: 1,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative'
    }, style]}
    {...rest}
  >
    {trophy && (
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 2, backgroundColor: colors.gold, opacity: 0.9 }} />
    )}
    {children}
  </View>
);

export const Button: React.FC<PressableProps & { variant?: 'primary' | 'secondary' | 'mint' }>
= ({ style, children, variant = 'secondary', ...rest }) => {
  const bg = variant === 'primary' ? colors.primary : variant === 'mint' ? colors.mint : colors.chip;
  const fg = variant === 'primary' || variant === 'mint' ? '#000' : colors.textHigh;
  return (
    <Pressable
      style={({ pressed }) => [{
        backgroundColor: bg,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: colors.steel,
        opacity: pressed ? 0.9 : 1
      }, style]}
      {...rest}
    >
      <Text style={{ color: fg, fontWeight: '600' }}>{children}</Text>
    </Pressable>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: string }>
= ({ children, color }) => (
  <View style={{ backgroundColor: color ?? colors.chip, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderColor: colors.steel, borderWidth: 1 }}>
    <Text style={{ color: color ? '#000' : colors.textHigh, fontSize: 12 }}>{children}</Text>
  </View>
);