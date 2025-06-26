<script lang="ts">
  import { signIn, signUp } from '$lib/auth/client'
  import { updateAuthState } from '$lib/auth/stores'
  import { goto } from '$app/navigation'

  let mode: 'signin' | 'signup' = 'signin'
  let email = ''
  let password = ''
  let error = ''
  let loading = false

  async function handleSubmit() {
    error = ''
    loading = true

    try {
      const result = mode === 'signin' 
        ? await signIn.emailPassword({ email, password })
        : await signUp.emailPassword({ email, password })

      if (result.data) {
        updateAuthState(result.data.user, result.data.session)
        goto('/')
      } else {
        error = result.error?.message || 'Authentication failed'
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred'
    } finally {
      loading = false
    }
  }

  function toggleMode() {
    mode = mode === 'signin' ? 'signup' : 'signin'
    error = ''
  }
</script>

<div class="auth-container">
  <h1>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h1>
  
  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        type="email"
        bind:value={email}
        required
        disabled={loading}
      />
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input
        id="password"
        type="password"
        bind:value={password}
        required
        disabled={loading}
        minlength="8"
      />
    </div>

    {#if error}
      <div class="error">{error}</div>
    {/if}

    <button type="submit" disabled={loading}>
      {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
    </button>
  </form>

  <p class="toggle">
    {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
    <button type="button" on:click={toggleMode} class="link">
      {mode === 'signin' ? 'Sign Up' : 'Sign In'}
    </button>
  </p>
</div>

<style>
  .auth-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    background: var(--color-bg-2);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  h1 {
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  input:disabled {
    opacity: 0.6;
  }

  button[type="submit"] {
    width: 100%;
    padding: 0.75rem;
    background: var(--color-theme-1);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  button[type="submit"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  button[type="submit"]:hover:not(:disabled) {
    opacity: 0.9;
  }

  .error {
    color: #dc2626;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
  }

  .toggle {
    text-align: center;
    margin-top: 1.5rem;
  }

  .link {
    background: none;
    border: none;
    color: var(--color-theme-1);
    text-decoration: underline;
    cursor: pointer;
    font-size: inherit;
  }
</style>