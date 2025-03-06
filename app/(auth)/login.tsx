import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

interface Login {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const [form, setForm] = useState<Login>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      await login(form.email, form.password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.atlas}>Atlas</Text>
          <Text style={styles.school}>SCHOOL</Text>
          <Text style={styles.subtitle}>Login</Text>
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
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signupContainer} 
            onPress={() => router.push('/(auth)/register')}
            disabled={isLoading}
          >
            <Text style={styles.link}>Create a new account</Text>
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
