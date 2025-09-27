import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Pressable, FlatList } from 'react-native';
import { colors, spacing } from '@/theme/tokens';
import { Card, Button, Badge } from '@/components/ui';
import { useStore } from '@/store/AppStore';

export const PartiesScreen: React.FC = () => {
  const { parties, selectedPartyId, selectParty, createParty, joinParty } = useStore();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [type, setType] = useState<'friendly' | 'prize' | 'competitive'>('friendly');
  const [code, setCode] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink, padding: spacing(2) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(2) }}>
        <Text style={{ color: colors.textHigh, fontSize: 20, fontWeight: '700' }}>Your Parties</Text>
        <Button variant='primary' onPress={() => setOpen(true)}>Create / Join</Button>
      </View>

      <FlatList
        data={parties}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Card style={{ padding: 12, marginBottom: 10, borderColor: item.id===selectedPartyId? colors.primary: colors.steel, borderWidth: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: colors.textHigh, fontWeight: '700' }}>{item.name}</Text>
                <Text style={{ color: colors.textMid, marginTop: 2 }}>{item.type}</Text>
              </View>
              <Button onPress={() => selectParty(item.id)} disabled={item.id===selectedPartyId}>{item.id===selectedPartyId? 'Current' : 'Open'}</Button>
            </View>
          </Card>
        )}
      />

      <Modal visible={open} transparent animationType='fade' onRequestClose={()=>setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'center', padding: spacing(2) }} onPress={()=>setOpen(false)}>
          <Pressable style={{ backgroundColor: colors.slate, borderRadius: 12, borderColor: colors.steel, borderWidth: 1, padding: 16 }} onPress={(e)=>e.stopPropagation()}>
            <Text style={{ color: colors.textHigh, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>{mode === 'create' ? 'Create Party' : 'Join Party'}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <Button variant={mode==='create'?'primary':'secondary'} onPress={()=>setMode('create')}>Create</Button>
              <Button variant={mode==='join'?'primary':'secondary'} onPress={()=>setMode('join')}>Join</Button>
            </View>
            {mode === 'create' ? (
              <>
                <Text style={{ color: colors.textMid, marginBottom: 6 }}>Name</Text>
                <TextInput value={name} onChangeText={setName} placeholder='Sunday Sweats' placeholderTextColor={colors.textLow} style={{ color: colors.textHigh, borderColor: colors.steel, borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 8 }} />
                <Text style={{ color: colors.textMid, marginBottom: 6 }}>Type (friendly | prize | competitive)</Text>
                <TextInput value={type} onChangeText={(t)=>setType((t as any))} placeholder='friendly' placeholderTextColor={colors.textLow} style={{ color: colors.textHigh, borderColor: colors.steel, borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 12 }} />
                <Button variant='primary' onPress={()=>{ createParty(name, type); setOpen(false); setName(''); setType('friendly'); }}>Create</Button>
              </>
            ) : (
              <>
                <Text style={{ color: colors.textMid, marginBottom: 6 }}>Join code</Text>
                <TextInput value={code} onChangeText={setCode} placeholder='F-1234 / P-1234 / C-1234' placeholderTextColor={colors.textLow} style={{ color: colors.textHigh, borderColor: colors.steel, borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 12 }} />
                <Button variant='primary' onPress={()=>{ joinParty(code); setOpen(false); setCode(''); }}>Join</Button>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};