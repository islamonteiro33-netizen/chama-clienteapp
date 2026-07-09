import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { useCart } from '../context/CartContext';

const money = v => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default function ProductCard({ product }) {
  const { add } = useCart();
  return (
    <View style={styles.card}>
      {product.oldPrice && <Text style={styles.badge}>PROMO</Text>}
      <View style={styles.image}><Text style={styles.emoji}>{product.image}</Text></View>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.cat}>{product.category}</Text>
      <View style={styles.row}>
        <View>
          {product.oldPrice && <Text style={styles.old}>{money(product.oldPrice)}</Text>}
          <Text style={styles.price}>{money(product.price)}</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={() => add(product)}><Text style={styles.btnText}>+</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '48%', backgroundColor: colors.card, borderRadius: 22, padding: 14, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 3, position: 'relative' },
  badge: { position: 'absolute', zIndex: 2, right: 10, top: 10, backgroundColor: colors.danger, color: colors.white, fontWeight: '900', fontSize: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99 },
  image: { height: 92, borderRadius: 18, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 44 },
  name: { marginTop: 10, fontWeight: '900', color: colors.text, fontSize: 15 },
  cat: { color: colors.muted, fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 10 },
  old: { color: colors.muted, textDecorationLine: 'line-through', fontSize: 11 },
  price: { color: colors.primary, fontWeight: '900', fontSize: 16 },
  btn: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: colors.white, fontSize: 24, fontWeight: '900', marginTop: -2 }
});
