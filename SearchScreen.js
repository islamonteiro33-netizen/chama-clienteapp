import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function Header() {
  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.hello}>Olá, Cliente 👋</Text>
        <Text style={styles.title}>O que vai beber hoje?</Text>
      </View>
      <TextInput style={styles.search} placeholder="Buscar bebidas, gelo, conveniência..." placeholderTextColor={colors.muted} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingTop: 54, backgroundColor: colors.white },
  hello: { color: colors.muted, fontSize: 14 },
  title: { color: colors.text, fontSize: 25, fontWeight: '900', marginTop: 4 },
  search: { marginTop: 18, height: 48, borderRadius: 16, backgroundColor: colors.bg, paddingHorizontal: 16, fontSize: 15, borderWidth: 1, borderColor: colors.border }
});
