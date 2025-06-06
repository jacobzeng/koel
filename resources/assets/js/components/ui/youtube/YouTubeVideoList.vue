<template>
  <div class="youtube-extra-wrapper overflow-x-hidden">
    <template v-if="videos.length">
      <ul class="space-y-4 mb-8">
        <li v-for="video in videos" :key="video.id.videoId" data-testid="youtube-video">
          <YouTubeVideo :video="video" />
        </li>
      </ul>
      <Btn v-if="!loading" small @click.prevent="loadMore">Load More</Btn>
    </template>

    <YouTubeVideoListSkeleton v-if="loading" />

    <p v-if="somethingWrong">
      Failed to load videos.
      <a href="#" @click.prevent="loadMore">Try again</a>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, toRefs, watch } from 'vue'
import { youTubeService } from '@/services/youTubeService'
import { useErrorHandler } from '@/composables/useErrorHandler'

const props = defineProps<{ song: Song }>()
const Btn = defineAsyncComponent(() => import('@/components/ui/form/Btn.vue'))
const YouTubeVideo = defineAsyncComponent(() => import('@/components/ui/youtube/YouTubeVideoItem.vue'))
const YouTubeVideoListSkeleton = defineAsyncComponent(() => import('@/components/ui/skeletons/YouTubeVideoListSkeleton.vue'))

const { song } = toRefs(props)

const loading = ref(false)
const videos = ref<YouTubeVideo[]>([])

let nextPageToken = ''

const loadMore = async () => {
  loading.value = true

  try {
    const result = await youTubeService.searchVideosBySong(song.value, nextPageToken)
    nextPageToken = result.nextPageToken
    videos.value.push(...(result.items || []))
  } catch (error: unknown) {
    useErrorHandler().handleHttpError(error)
  } finally {
    loading.value = false
  }
}

const somethingWrong = computed(() => !loading.value && videos.value.length === 0)

watch(song, () => {
  videos.value = []
  nextPageToken = ''
  loadMore()
}, { immediate: true })
</script>
