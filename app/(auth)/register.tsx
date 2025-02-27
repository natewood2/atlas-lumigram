import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';

interface Register {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export default function RegisterScreen() {
  const [form, setForm] = useState<Register>({
    fullName: '',
    username: '',
    email: '',
    password: ''
  });

  const handleRegister = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.atlas}>Atlas</Text>
          <Text style={styles.school}>SCHOOL</Text>
          <Text style={styles.subtitle}>Register</Text>
        </View>
        
        <View style={styles.formContainer}>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#ffffff"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(text) => setForm({...form, email: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#ffffff"
            secureTextEntry
            value={form.password}
            onChangeText={(text) => setForm({...form, password: text})}
          />
          
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signupContainer} 
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.link}>Login to existing acount</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00003C',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  atlas: {
    fontSize: 64,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },
  school: {
    fontSize: 16,
    fontWeight: '900',
    color: '#4BEBC0',
    letterSpacing: 1,
    marginTop: -12,
    marginLeft: 72,
    marginBottom: 10,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4BEBC0',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    color: 'white',
  },
  button: {
    backgroundColor: '#4BEBC0',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 25,
  },
  subtitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  signupContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  link: {
    color: 'white',
    fontSize: 14,
  },
});