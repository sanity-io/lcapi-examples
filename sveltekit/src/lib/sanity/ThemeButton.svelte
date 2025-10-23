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
  class="cursor-pointer rounded-md bg-(--theme-text) px-4 py-2 text-sm font-semibold text-(--theme-background) transition ease-in-out select-none focus:ring-2 focus:ring-(--theme-text) focus:ring-offset-2 focus:ring-offset-(--theme-background) focus:outline-hidden focus:duration-0 disabled:cursor-not-allowed disabled:opacity-50 {pending
    ? 'animate-pulse cursor-wait duration-150'
    : 'duration-1000'}"
>
  {pending ? 'Generating...' : 'Random Color Theme'}
</button>
