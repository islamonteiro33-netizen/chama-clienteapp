import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { categories, products } from '../services/api';
import { colors } from '../theme/colors';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header />
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.banner}>
        <Text style={styles.bannerSmall}>Entrega rápida</Text>
        <Text style={styles.bannerTitle}>Bebidas geladas em poucos minutos</Text>
        <Text style={styles.bannerOff}>Cupom PRIMEIRA10</Text>
      </LinearGradient>
      <Text style={styles.section}>Categorias</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 18 }}>
        {categories.map(c => <TouchableOpacity key={c.id} style={styles.category}><Text style={styles.catIcon}>{c.icon}</Text><Text style={styles.catText}>{c.title}</Text></TouchableOpacity>)}
      </ScrollView>
      <View style={styles.rowTitle}><Text style={styles.section}>Mais pedidos</Text><Text style={styles.see}>Ver tudo</Text></View>
      <View style={styles.grid}>{products.map(p => <ProductCard key={p.id} product={p} />)}</View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  banner: { margin: 18, borderRadius: 26, padding: 22, minHeight: 150, justifyContent: 'center' },
  bannerSmall: { color: '#DCFCE7', fontWeight: '800' },
  bannerTitle: { color: colors.white, fontSize: 25, fontWeight: '900', marginTop: 8, width: '82%' },
  bannerOff: { marginTop: 14, backgroundColor: colors.white, color: colors.primary, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, fontWeight: '900' },
  section: { fontSize: 20, fontWeight: '900', color: colors.text, marginLeft: 18, marginTop: 4, marginBottom: 12 },
  category: { width: 92, height: 90, backgroundColor: colors.white, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: colors.border },
  catIcon: { fontSize: 30 },
  catText: { fontWeight: '800', color: colors.text, fontSize: 12, textAlign: 'center', marginTop: 6 },
  rowTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingRight: 20 },
  see: { color: colors.primary, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 30 }
});
