// src/app/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { styles } from './styles';

export default function Home() {
  const [name, setName] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá, {name}!</Text>
      <Input
        placeholder="Digite seu nome"
        onChangeText={setName}
      />
      <Button title="Entrar" onPress={() => alert(`Olá, ${name}!`)} />
    </View>
  );
}
