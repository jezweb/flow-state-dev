<script lang="ts">
  import { user } from '$lib/auth/stores'
  import { signOut } from '$lib/auth/client'
  import { clearAuthState } from '$lib/auth/stores'
  import { goto } from '$app/navigation'

  async function handleSignOut() {
    await signOut()
    clearAuthState()
    goto('/')
  }
</script>

<div class="profile-container">
  <h1>Profile</h1>
  
  {#if $user}
    <div class="profile-info">
      <p><strong>Email:</strong> {$user.email}</p>
      <p><strong>User ID:</strong> {$user.id}</p>
      <p><strong>Created:</strong> {new Date($user.createdAt).toLocaleDateString()}</p>
    </div>

    <button on:click={handleSignOut} class="sign-out">
      Sign Out
    </button>
  {:else}
    <p>Not authenticated</p>
  {/if}
</div>

<style>
  .profile-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
  }

  .profile-info {
    background: var(--color-bg-2);
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .profile-info p {
    margin: 0.5rem 0;
  }

  .sign-out {
    background: #dc2626;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }

  .sign-out:hover {
    background: #b91c1c;
  }
</style>