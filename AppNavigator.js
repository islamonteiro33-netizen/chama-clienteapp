import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
export default function SearchScreen(){return <View style={s.wrap}><Text style={s.title}>Buscar</Text><TextInput style={s.input} placeholder="Digite o produto"/><Text style={s.hint}>Busque por cerveja, whisky, gelo, refrigerante e conveniência.</Text></View>}
const s=StyleSheet.create({wrap:{flex:1,backgroundColor:colors.bg,padding:22,paddingTop:60},title:{fontSize:28,fontWeight:'900'},input:{backgroundColor:colors.white,borderRadius:18,padding:16,marginTop:20,borderWidth:1,borderColor:colors.border},hint:{marginTop:16,color:colors.muted,fontSize:15}})
