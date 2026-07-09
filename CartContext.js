import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
export default function ProfileScreen(){return <View style={s.wrap}><Text style={s.avatar}>👤</Text><Text style={s.title}>Cliente Premium</Text>{['Dados pessoais','Endereços','Cartões','Histórico','Favoritos','Cupons','Cashback'].map(x=><View key={x} style={s.item}><Text style={s.itemText}>{x}</Text><Text>›</Text></View>)}</View>}
const s=StyleSheet.create({wrap:{flex:1,backgroundColor:colors.bg,padding:20,paddingTop:60},avatar:{fontSize:64,textAlign:'center'},title:{textAlign:'center',fontSize:24,fontWeight:'900',marginBottom:24},item:{backgroundColor:colors.white,borderRadius:18,padding:18,marginBottom:10,flexDirection:'row',justifyContent:'space-between'},itemText:{fontWeight:'800',color:colors.text}})
