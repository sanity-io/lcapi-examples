<script lang="ts">
  let pending = $state(false)

  async function handleClick() {
    pending = true
    try {
      await fetch('https://lcapi-examples-api.sanity.dev/api/random-color-theme', {
        method: 'PUT',
      })
    } finally {
      pending = false
    }
  }
</script>

<button
  disabled={pending}
  onclick={handleClick}
  class="bg-(--theme-text) text-(--theme-background) focus:ring-(--theme-text) focus:ring-offset-(--theme-background) focus:outline-hidden cursor-pointer rounded-md px-4 py-2 text-sm font-semibold transition ease-in-out focus:ring-2 focus:ring-offset-2 focus:duration-0 disabled:cursor-not-allowed disabled:opacity-50 {pending
    ? 'animate-pulse cursor-wait duration-150'
    : 'duration-1000'}"
>
  {pending ? 'Generating...' : 'Random Color Theme'}
</button>
