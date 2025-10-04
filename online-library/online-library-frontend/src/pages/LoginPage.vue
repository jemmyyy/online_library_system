<template>
  <v-container>
    <v-card class="mx-auto mt-12" max-width="400">
      <v-card-title>Login</v-card-title>
      <v-card-text>
        <v-text-field label="Email" v-model="email"></v-text-field>
        <v-text-field label="Password" type="password" v-model="password"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="login">Login</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const auth = useAuthStore();
    const router = useRouter();

    const login = async () => {
      try {
        await auth.login(email.value, password.value);
        router.push('/dashboard');
      } catch (err) {
        alert('Invalid credentials');
      }
    };

    return { email, password, login };
  },
};
</script>
