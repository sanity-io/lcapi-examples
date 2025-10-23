<script lang="ts">
  import type {PageProps} from './$types'

  let {data}: PageProps = $props()
  let title = data.page || 'SvelteKit'
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>
<h1
  class="text-4xl leading-tight font-bold tracking-tighter text-balance md:text-6xl lg:pr-8 lg:text-8xl"
>
  {title}
</h1>
