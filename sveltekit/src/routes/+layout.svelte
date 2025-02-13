<script lang="ts">
	import SanityLive from '$lib/sanity/SanityLive.svelte'
  import ThemeButton from '$lib/sanity/ThemeButton.svelte'
import '../app.css';

		import type { LayoutProps } from './$types';
	let { children, data }: LayoutProps = $props();
</script>

<main
class="bg-(--theme-background) text-(--theme-text)  transition-colors duration-1000 ease-in-out"
style:--theme-background={data.theme?.background}
style:--theme-text={data.theme?.text}
>
<div class="relative flex min-h-dvh flex-col items-center justify-evenly overflow-auto">
{@render children()}
<ThemeButton />
</div>
</main>
<SanityLive />