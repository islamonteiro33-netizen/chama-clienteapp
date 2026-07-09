import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, SafeAreaView, ScrollView, StatusBar as RNStatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

const API = 'https://chamabebidas.com.br/api';
const C = {
  bg: '#101114',
  bg2: '#17191F',
  panel: '#1D2028',
  panel2: '#252A34',
  line: '#343A46',
  text: '#FFFFFF',
  muted: '#A7ABB4',
  gold: '#FFC107',
  gold2: '#FFE08A',
  green: '#22C55E',
  red: '#EF4444',
  orange: '#F97316',
};

type Screen = 'login' | 'home' | 'store' | 'cart' | 'checkout' | 'tracking' | 'profile' | 'menuPage';
type Store = { id: any; name?: string; store_name?: string; address?: string; rating?: number; delivery_time?: string; delivery_fee?: number };
type Product = { id: any; name?: string; title?: string; product_name?: string; price?: number; category?: string; offer?: boolean };

const STORES: Store[] = [
  { id: 1, store_name: 'Chama Adega', address: 'Tatuí - SP', rating: 4.9, delivery_time: '25-35 min', delivery_fee: 7 },
  { id: 2, store_name: 'Adega Central', address: 'Centro - Tatuí', rating: 4.7, delivery_time: '30-40 min', delivery_fee: 8 },
];
const PRODUCTS: Product[] = [
  { id: 1, name: 'Cerveja lata gelada', price: 5.5, category: 'Cervejas', offer: true },
  { id: 2, name: 'Gelo pacote 5kg', price: 10, category: 'Gelo' },
  { id: 3, name: 'Energético 2L', price: 14.9, category: 'Energéticos' },
  { id: 4, name: 'Vodka premium', price: 39.9, category: 'Destilados' },
  { id: 5, name: 'Combo cerveja + gelo', price: 49.9, category: 'Combos', offer: true },
  { id: 6, name: 'Refrigerante 2L', price: 11.9, category: 'Refrigerantes' },
];
const CATS = [['🍺','Cervejas'], ['🍷','Vinhos'], ['🥃','Destilados'], ['🧊','Gelo'], ['🥤','Refrigerantes'], ['🍟','Petiscos'], ['🎁','Combos']];

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [stores, setStores] = useState<Store[]>(STORES);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<any[]>([]);
  const [order, setOrder] = useState<any | null>(null);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('Todos');
  const [coupon, setCoupon] = useState('');
  const [payment, setPayment] = useState('PIX');
  const [pageTitle, setPageTitle] = useState('');
  const [securityCode, setSecurityCode] = useState('');

  useEffect(() => { boot(); }, []);

  async function boot() {
    const n = await AsyncStorage.getItem('clientName');
    const p = await AsyncStorage.getItem('clientPhone');
    const a = await AsyncStorage.getItem('clientAddress');
    if (n) { setName(n); setPhone(p || ''); setAddress(a || ''); setScreen('home'); }
    loadStores();
  }
  async function loadStores() {
    try { const r = await fetch(`${API}/stores`); const d = await r.json(); if (Array.isArray(d)) setStores(d); } catch {}
  }
  async function login() {
    if (!name.trim() || !phone.trim()) return Alert.alert('Atenção', 'Digite nome e WhatsApp.');
    await AsyncStorage.setItem('clientName', name);
    await AsyncStorage.setItem('clientPhone', phone);
    await AsyncStorage.setItem('clientAddress', address);
    setScreen('home');
  }
  async function openStore(s: Store) {
    setStore(s); setCat('Todos'); setQuery('');
    try {
      const r = await fetch(`${API}/stores/${s.id}/products`);
      const d = await r.json();
      const arr = Array.isArray(d) ? d : d.products || d.data;
      if (Array.isArray(arr)) setProducts(arr); else setProducts(PRODUCTS);
    } catch { setProducts(PRODUCTS); }
    setScreen('store');
  }
  function price(p: any) { return Number(p.price || 0); }
  function add(p: any) { setCart(c => { const i = c.findIndex(x => String(x.id) === String(p.id)); if (i >= 0) { const n = [...c]; n[i].qty += 1; return n; } return [...c, { ...p, qty: 1 }]; }); }
  function dec(p: any) { setCart(c => c.map(x => x.id === p.id ? { ...x, qty: x.qty - 1 } : x).filter(x => x.qty > 0)); }
  function openPage(t: string) { setPageTitle(t); setScreen('menuPage'); }
  function makeCode() { return String(Math.floor(1000 + Math.random() * 9000)); }
  function zap() { Linking.openURL(`https://wa.me/55${phone.replace(/\D/g, '')}`); }
  function call() { Linking.openURL(`tel:${phone.replace(/\D/g, '')}`); }

  const visibleProducts = useMemo(() => products.filter(p => {
    const n = (p.name || p.title || p.product_name || '').toLowerCase();
    const byQ = !query || n.includes(query.toLowerCase()) || (p.category || '').toLowerCase().includes(query.toLowerCase());
    const byC = cat === 'Todos' || (cat === 'Promoções' ? !!p.offer : (p.category || '') === cat);
    return byQ && byC;
  }), [products, query, cat]);
  const homeStores = useMemo(() => stores.filter(s => {
    const q = query.toLowerCase();
    return !query || (s.store_name || s.name || '').toLowerCase().includes(q) || (s.address || '').toLowerCase().includes(q);
  }), [stores, query]);
  const subtotal = useMemo(() => cart.reduce((sum, p) => sum + price(p) * p.qty, 0), [cart]);
  const delivery = Number(store?.delivery_fee || 7);
  const discount = coupon.trim().toUpperCase() === 'CHAMA10' ? 10 : 0;
  const total = Math.max(0, subtotal + delivery - discount);

  async function finish() {
    const code = securityCode || makeCode(); setSecurityCode(code);
    const payload = { storeId: store?.id, customerName: name, customerPhone: phone, address, items: cart, total, paymentMethod: payment, status: 'pending', securityCode: code, deliveryCode: code, pickupCode: code };
    try { const r = await fetch(`${API}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const d = await r.json(); setOrder(d.order || d || { id: 'PED_DEMO', ...payload }); }
    catch { setOrder({ id: 'PED_DEMO', ...payload }); }
    setCart([]); setScreen('tracking');
  }

  if (screen === 'login') return <SafeAreaView style={s.bg}><StatusBar style="light"/><RNStatusBar barStyle="light-content" backgroundColor={C.bg}/><ScrollView contentContainerStyle={s.login}><View style={s.logo}><Text style={{fontSize:42}}>🍺</Text></View><Text style={s.title}>CHAMA ADEGA</Text><Text style={s.subCenter}>Sua bebida chegou.</Text><Input ph="Seu nome" v={name} set={setName}/><Input ph="WhatsApp" v={phone} set={setPhone}/><Input ph="Endereço de entrega" v={address} set={setAddress}/><Button title="ENTRAR" onPress={login}/></ScrollView></SafeAreaView>;

  if (screen === 'store' && store) return <SafeAreaView style={s.bg}><Header title={store.store_name || store.name || 'Adega'} back={() => setScreen('home')}/><ScrollView contentContainerStyle={{paddingBottom:105}}><View style={s.cover}><Text style={s.coverBrand}>CHAMA ADEGA</Text><Text style={{fontSize:80}}>🍾</Text><Text style={s.coverSub}>🟢 Aberta • Online • {store.delivery_time || '25-35 min'}</Text></View><View style={s.storeHead}><Text style={s.big}>{store.store_name || store.name}</Text><Text style={s.sub}>⭐ {store.rating || 4.8} • Entrega R$ {delivery.toFixed(2)}</Text><TextInput style={s.search} placeholder="Buscar cerveja, gelo, whisky..." placeholderTextColor={C.muted} value={query} onChangeText={setQuery}/></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>{['Todos','Promoções','Cervejas','Vinhos','Destilados','Gelo','Refrigerantes','Combos'].map(c => <TouchableOpacity key={c} onPress={() => setCat(c)}><Chip title={c} on={cat === c}/></TouchableOpacity>)}</ScrollView>{visibleProducts.length === 0 ? <View style={s.empty}><Text style={s.white}>Nenhum produto encontrado</Text><Text style={s.sub}>Tente outra categoria.</Text></View> : visibleProducts.map(p => <View key={p.id} style={s.product}><View style={s.prodImg}><Text style={{fontSize:36}}>{p.category === 'Gelo' ? '🧊' : p.category === 'Destilados' ? '🥃' : '🍺'}</Text></View><View style={{flex:1}}><Text style={s.pname}>{p.name || p.title || p.product_name}</Text><Text style={s.sub}>{p.category || 'Bebidas'}</Text><Text style={s.price}>R$ {price(p).toFixed(2)}</Text></View><TouchableOpacity style={s.add} onPress={() => add(p)}><Text style={s.addText}>+</Text></TouchableOpacity></View>)}</ScrollView>{cart.length > 0 && <TouchableOpacity style={s.cartBar} onPress={() => setScreen('cart')}><Text style={s.cartText}>Ver carrinho • {cart.reduce((n,p)=>n+p.qty,0)} itens • R$ {subtotal.toFixed(2)}</Text></TouchableOpacity>}</SafeAreaView>;

  if (screen === 'cart') return <SafeAreaView style={s.bg}><Header title="Carrinho" back={() => setScreen(store ? 'store' : 'home')}/><ScrollView contentContainerStyle={{padding:16,paddingBottom:100}}>{cart.length === 0 && <Panel title="Carrinho vazio"><Text style={s.sub}>Adicione produtos para continuar.</Text></Panel>}{cart.map(p => <View key={p.id} style={s.cartItem}><View><Text style={s.pname}>{p.name || p.title}</Text><Text style={s.price}>R$ {(price(p) * p.qty).toFixed(2)}</Text></View><View style={s.qty}><TouchableOpacity onPress={() => dec(p)}><Text style={s.qtyBtn}>−</Text></TouchableOpacity><Text style={s.white}>{p.qty}</Text><TouchableOpacity onPress={() => add(p)}><Text style={s.qtyBtn}>+</Text></TouchableOpacity></View></View>)}<View style={s.panel}><Text style={s.pname}>Resumo do pedido</Text><Line l="Subtotal" v={`R$ ${subtotal.toFixed(2)}`}/><Line l="Entrega" v={`R$ ${delivery.toFixed(2)}`}/><Line l="Desconto" v={`-R$ ${discount.toFixed(2)}`}/><Input ph="Cupom: CHAMA10" v={coupon} set={setCoupon}/><Text style={s.total}>Total: R$ {total.toFixed(2)}</Text><Button title="FINALIZAR" onPress={() => cart.length ? setScreen('checkout') : Alert.alert('Carrinho vazio','Adicione produtos primeiro.')}/></View></ScrollView></SafeAreaView>;

  if (screen === 'checkout') return <SafeAreaView style={s.bg}><Header title="Pagamento" back={() => setScreen('cart')}/><ScrollView contentContainerStyle={{padding:16}}><Panel title="Entrega"><Text style={s.sub}>{address || 'Endereço não informado'}</Text></Panel><Panel title="Código de segurança"><Text style={s.code}>{securityCode || 'Será gerado'}</Text><Text style={s.sub}>Use esse código para confirmar retirada/entrega.</Text></Panel><Panel title="Forma de pagamento">{['PIX','Cartão','Dinheiro'].map(p => <TouchableOpacity key={p} style={[s.pay, payment === p && s.payOn]} onPress={() => setPayment(p)}><Text style={payment === p ? s.payTextOn : s.white}>{p}</Text></TouchableOpacity>)}</Panel><Panel title="Resumo"><Line l="Total" v={`R$ ${total.toFixed(2)}`}/><Button title="CONFIRMAR PEDIDO" onPress={finish}/></Panel></ScrollView></SafeAreaView>;

  if (screen === 'tracking') return <SafeAreaView style={s.bg}><Header title="Acompanhar pedido" back={() => setScreen('home')}/><View style={s.mapBox}><OSMMap/></View><ScrollView contentContainerStyle={{padding:16}}><View style={s.track}><Text style={s.big}>Pedido #{order?.id || 'novo'}</Text><Text style={s.sub}>Código de segurança</Text><Text style={s.code}>{order?.securityCode || order?.deliveryCode || securityCode || '----'}</Text><Step active title="Pedido recebido"/><Step active={order?.status !== 'pending'} title="Adega preparando"/><Step title="Entregador indo até a adega"/><Step title="Pedido retirado"/><Step title="A caminho do cliente"/><Step title="Pedido entregue"/><View style={s.contactRow}><Small title="📞 Ligar" onPress={call}/><Small title="💬 WhatsApp" onPress={zap}/><Small dark title="Cancelar" onPress={() => Alert.alert('Cancelar','Cancelamento solicitado.')}/></View></View></ScrollView></SafeAreaView>;

  if (screen === 'profile') return <SafeAreaView style={s.bg}><Header title="Perfil" back={() => setScreen('home')}/><ScrollView contentContainerStyle={{padding:16,paddingBottom:95}}><Panel title={name || 'Cliente'}><Text style={s.sub}>{phone}</Text><Text style={s.sub}>{address}</Text></Panel>{['Meus pedidos','Favoritos','Cupons','Carteira','Endereços','Configurações'].map(x => <TouchableOpacity key={x} style={s.menuLine} onPress={() => openPage(x)}><Text style={s.white}>{x}</Text><Text style={s.sub}>›</Text></TouchableOpacity>)}</ScrollView><Nav screen={screen} setScreen={setScreen}/></SafeAreaView>;

  if (screen === 'menuPage') return <SafeAreaView style={s.bg}><Header title={pageTitle} back={() => setScreen('profile')}/><View style={s.pageBox}><Text style={s.big}>{pageTitle}</Text><Text style={s.sub}>Área preparada para integração real com a API.</Text>{pageTitle === 'Cupons' && <Text style={s.code}>CHAMA10</Text>}{pageTitle === 'Endereços' && <Text style={s.white}>{address || 'Nenhum endereço cadastrado'}</Text>}</View></SafeAreaView>;

  return <SafeAreaView style={s.bg}><RNStatusBar barStyle="light-content" backgroundColor={C.bg}/><View style={s.top}><View><Text style={s.brand}>🍺 CHAMA ADEGA</Text><Text style={s.location}>📍 {address || 'Adicionar endereço'}  •  🟢 Aberta</Text><Text style={s.delivery}>Entrega 25-35 min</Text></View><TouchableOpacity onPress={() => setScreen('cart')} style={s.cartMini}><Text style={s.cartMiniText}>🛒 {cart.reduce((n,p)=>n+p.qty,0)}</Text></TouchableOpacity></View><ScrollView contentContainerStyle={{padding:16,paddingBottom:100}}><TextInput style={s.search} placeholder="Buscar bebidas..." placeholderTextColor={C.muted} value={query} onChangeText={setQuery}/><View style={s.banner}><View style={{flex:1}}><Text style={s.bannerKicker}>PROMOÇÕES DO DIA</Text><Text style={s.bannerTitle}>Bebida gelada em poucos minutos</Text><Text style={s.bannerSub}>Cerveja • Gelo • Combos • Destilados</Text><TouchableOpacity style={s.bannerBtn} onPress={() => { setCat('Promoções'); setStore(STORES[0]); setProducts(PRODUCTS); setScreen('store'); }}><Text style={s.bannerBtnText}>Ver ofertas</Text></TouchableOpacity></View><Text style={{fontSize:70}}>🍻</Text></View><Text style={s.section}>Categorias</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{CATS.map(c => <TouchableOpacity key={c[1]} style={s.category} onPress={() => { setCat(c[1]); setStore(STORES[0]); setProducts(PRODUCTS); setScreen('store'); }}><Text style={{fontSize:28}}>{c[0]}</Text><Text style={s.catText}>{c[1]}</Text></TouchableOpacity>)}</ScrollView><Text style={s.section}>🔥 Adegas próximas</Text>{homeStores.map(st => <TouchableOpacity key={st.id} style={s.store} onPress={() => openStore(st)}><View style={s.storeIcon}><Text style={{fontSize:32}}>🏪</Text></View><View style={{flex:1}}><Text style={s.pname}>{st.store_name || st.name || 'Adega'}</Text><Text style={s.sub}>⭐ {st.rating || 4.8} • {st.delivery_time || '25-35 min'} • R$ {(st.delivery_fee || 7).toFixed(2)}</Text><Text style={s.green}>Aberta agora</Text></View><Text style={s.arrow}>›</Text></TouchableOpacity>)}</ScrollView><Nav screen={screen} setScreen={setScreen}/></SafeAreaView>;
}

function OSMMap() { const html = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>html,body,#map{height:100%;margin:0;background:#101114}.leaflet-tile{filter:brightness(.55) saturate(.65)}.leaflet-control-attribution{display:none}</style></head><body><div id="map"></div><script>var map=L.map('map',{zoomControl:false,attributionControl:false}).setView([-23.355,-47.856],13);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);L.marker([-23.355,-47.856]).addTo(map);</script></body></html>`; return <WebView source={{html}} style={{flex:1}}/>; }
function Input({ph,v,set}: any) { return <TextInput style={s.input} placeholder={ph} placeholderTextColor={C.muted} value={v} onChangeText={set}/>; }
function Button({title,onPress}: any) { return <TouchableOpacity style={s.btn} onPress={onPress}><Text style={s.btnText}>{title}</Text></TouchableOpacity>; }
function Small({title,onPress,dark}: any) { return <TouchableOpacity style={dark ? s.smallDark : s.small} onPress={onPress}><Text style={dark ? s.white : s.smallText}>{title}</Text></TouchableOpacity>; }
function Header({title,back}: any) { return <View style={s.header}><TouchableOpacity onPress={back}><Text style={s.back}>‹</Text></TouchableOpacity><Text style={s.htitle}>{title}</Text><Text style={s.back}> </Text></View>; }
function Chip({title,on}: any) { return <View style={[s.chip, on && s.chipOn]}><Text style={on ? s.chipTextOn : s.chipText}>{title}</Text></View>; }
function Line({l,v}: any) { return <View style={s.line}><Text style={s.sub}>{l}</Text><Text style={s.white}>{v}</Text></View>; }
function Panel({title,children}: any) { return <View style={s.panel}><Text style={s.pname}>{title}</Text>{children}</View>; }
function Step({title,active}: any) { return <View style={s.step}><View style={[s.dot, active && {backgroundColor:C.gold, borderColor:C.gold}]}/><Text style={active ? s.white : s.sub}>{title}</Text></View>; }
function Nav({screen,setScreen}: any) { return <View style={s.nav}><TouchableOpacity onPress={() => setScreen('home')}><Text style={screen === 'home' ? s.navA : s.navT}>🏠{`\n`}Início</Text></TouchableOpacity><TouchableOpacity onPress={() => setScreen('tracking')}><Text style={screen === 'tracking' ? s.navA : s.navT}>📦{`\n`}Pedidos</Text></TouchableOpacity><TouchableOpacity onPress={() => setScreen('profile')}><Text style={screen === 'profile' ? s.navA : s.navT}>👤{`\n`}Perfil</Text></TouchableOpacity></View>; }

const s = StyleSheet.create({
  bg:{flex:1,backgroundColor:C.bg}, login:{flexGrow:1,justifyContent:'center',padding:24}, logo:{width:96,height:96,borderRadius:48,backgroundColor:C.gold,alignItems:'center',justifyContent:'center',alignSelf:'center',marginBottom:22}, title:{color:C.text,fontSize:32,fontWeight:'900',textAlign:'center',letterSpacing:1}, subCenter:{color:C.gold2,textAlign:'center',fontWeight:'800',marginBottom:18}, sub:{color:C.muted,fontWeight:'700'}, input:{backgroundColor:C.panel2,color:C.text,borderRadius:14,padding:16,marginTop:12,borderWidth:1,borderColor:C.line}, btn:{backgroundColor:C.gold,borderRadius:14,padding:16,alignItems:'center',marginTop:16}, btnText:{color:'#151515',fontWeight:'900'},
  top:{paddingTop:42,paddingHorizontal:18,paddingBottom:14,backgroundColor:C.bg2,flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderBottomWidth:1,borderBottomColor:C.line}, brand:{color:C.text,fontSize:22,fontWeight:'900'}, location:{color:C.muted,fontWeight:'800',marginTop:5}, delivery:{color:C.gold,fontWeight:'900',marginTop:3}, cartMini:{backgroundColor:C.panel,paddingHorizontal:13,paddingVertical:10,borderRadius:999,borderWidth:1,borderColor:C.line}, cartMiniText:{color:C.gold,fontWeight:'900'},
  search:{backgroundColor:C.panel2,color:C.text,borderRadius:16,padding:16,borderWidth:1,borderColor:C.line,marginTop:8}, banner:{marginTop:16,backgroundColor:C.panel,borderRadius:26,padding:18,flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderWidth:1,borderColor:C.line}, bannerKicker:{color:C.gold,fontSize:12,fontWeight:'900',letterSpacing:1}, bannerTitle:{color:C.text,fontSize:27,fontWeight:'900',marginTop:6}, bannerSub:{color:C.muted,fontWeight:'800',marginTop:6}, bannerBtn:{backgroundColor:C.gold,borderRadius:12,paddingHorizontal:14,paddingVertical:10,marginTop:14,alignSelf:'flex-start'}, bannerBtnText:{color:'#111',fontWeight:'900'}, section:{color:C.text,fontSize:19,fontWeight:'900',marginTop:22,marginBottom:12},
  category:{backgroundColor:C.panel,borderRadius:18,padding:14,alignItems:'center',marginRight:10,width:96,borderWidth:1,borderColor:C.line}, catText:{color:C.text,fontWeight:'800',fontSize:12,marginTop:6,textAlign:'center'}, store:{backgroundColor:C.panel,borderRadius:20,padding:16,marginBottom:12,flexDirection:'row',alignItems:'center',gap:14,borderWidth:1,borderColor:C.line}, storeIcon:{width:62,height:62,borderRadius:18,backgroundColor:C.panel2,alignItems:'center',justifyContent:'center'}, pname:{color:C.text,fontSize:17,fontWeight:'900'}, green:{color:C.green,fontWeight:'900',marginTop:4}, arrow:{color:C.muted,fontSize:36},
  header:{height:68,backgroundColor:C.bg2,flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:C.line}, back:{color:C.text,fontSize:38}, htitle:{color:C.text,fontSize:18,fontWeight:'900'}, cover:{height:180,backgroundColor:C.bg2,alignItems:'center',justifyContent:'center',borderBottomWidth:1,borderBottomColor:C.line}, coverBrand:{color:C.gold,fontWeight:'900',letterSpacing:3}, coverSub:{color:C.text,fontWeight:'900'}, storeHead:{padding:16,backgroundColor:C.panel,borderBottomWidth:1,borderBottomColor:C.line}, big:{color:C.text,fontSize:24,fontWeight:'900'}, catRow:{paddingHorizontal:16,paddingVertical:14}, chip:{backgroundColor:C.panel2,borderRadius:999,paddingHorizontal:16,paddingVertical:10,marginRight:8,borderWidth:1,borderColor:C.line}, chipOn:{backgroundColor:C.gold}, chipText:{color:C.text,fontWeight:'900'}, chipTextOn:{color:'#111',fontWeight:'900'},
  product:{backgroundColor:C.panel,borderRadius:20,padding:16,marginHorizontal:16,marginBottom:12,flexDirection:'row',alignItems:'center',gap:14,borderWidth:1,borderColor:C.line}, prodImg:{width:74,height:74,borderRadius:18,backgroundColor:C.panel2,alignItems:'center',justifyContent:'center'}, price:{color:C.gold,fontWeight:'900',fontSize:18,marginTop:8}, add:{width:50,height:50,borderRadius:25,backgroundColor:C.gold,alignItems:'center',justifyContent:'center'}, addText:{color:'#111',fontSize:28,fontWeight:'900'}, cartBar:{position:'absolute',left:12,right:12,bottom:15,backgroundColor:C.gold,borderRadius:16,padding:16,alignItems:'center'}, cartText:{color:'#111',fontWeight:'900'},
  cartItem:{backgroundColor:C.panel,borderRadius:18,padding:16,marginBottom:12,flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderWidth:1,borderColor:C.line}, qty:{flexDirection:'row',alignItems:'center',gap:18}, qtyBtn:{color:C.gold,fontWeight:'900',fontSize:28}, white:{color:C.text,fontWeight:'900'}, panel:{backgroundColor:C.panel,borderRadius:20,padding:16,marginTop:10,borderWidth:1,borderColor:C.line}, line:{flexDirection:'row',justifyContent:'space-between',paddingVertical:10,borderBottomWidth:1,borderBottomColor:C.line}, total:{color:C.text,fontSize:25,fontWeight:'900',marginTop:16}, pay:{backgroundColor:C.panel2,borderRadius:14,padding:15,marginTop:10,borderWidth:1,borderColor:C.line}, payOn:{backgroundColor:C.gold}, payTextOn:{color:'#111',fontWeight:'900'},
  mapBox:{height:260}, track:{backgroundColor:C.panel,borderRadius:20,padding:18,borderWidth:1,borderColor:C.line}, step:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:12}, dot:{width:18,height:18,borderRadius:9,backgroundColor:C.panel2,borderWidth:1,borderColor:C.line}, menuLine:{backgroundColor:C.panel,borderRadius:16,padding:16,marginBottom:10,flexDirection:'row',justifyContent:'space-between',borderWidth:1,borderColor:C.line}, nav:{position:'absolute',left:0,right:0,bottom:0,height:68,backgroundColor:'rgba(18,20,25,.98)',flexDirection:'row',justifyContent:'space-around',alignItems:'center',borderTopWidth:1,borderTopColor:C.line}, navT:{color:C.muted,textAlign:'center',fontSize:12,fontWeight:'800'}, navA:{color:C.gold,textAlign:'center',fontSize:12,fontWeight:'900'}, empty:{margin:16,backgroundColor:C.panel,borderRadius:18,padding:20,borderWidth:1,borderColor:C.line,alignItems:'center'}, code:{color:C.gold,fontSize:31,fontWeight:'900',letterSpacing:4,marginTop:8}, contactRow:{flexDirection:'row',gap:8,marginTop:16}, small:{flex:1,backgroundColor:C.gold,borderRadius:12,padding:12,alignItems:'center'}, smallDark:{flex:1,backgroundColor:C.panel2,borderRadius:12,padding:12,alignItems:'center',borderWidth:1,borderColor:C.line}, smallText:{color:'#111',fontWeight:'900'}, pageBox:{margin:16,backgroundColor:C.panel,borderRadius:20,padding:18,borderWidth:1,borderColor:C.line}
});
