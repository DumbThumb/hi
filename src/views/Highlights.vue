<template>
  <div class="highlights">
    <label for="duration">Highlight Duration</label>
    <select id="duration" v-model="duration" @change="fetchHighlights">
      <option v-for="d in durations" :key="d" :value="d">{{ d }}s</option>
    </select>

    <video v-if="videoUrl" controls :src="videoUrl" class="player"></video>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const eventId = route.params.id

const durations = [30, 60, 120]
const duration = ref(durations[0])
const videoUrl = ref('')

async function fetchHighlights() {
  try {
    const res = await fetch(`/events/${eventId}/highlights?duration=${duration.value}`)
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
    const blob = await res.blob()
    videoUrl.value = URL.createObjectURL(blob)
  } catch (err) {
    console.error(err)
    videoUrl.value = ''
  }
}
</script>

<style scoped>
.highlights {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.player {
  width: 100%;
  max-width: 640px;
  background: #000;
}
</style>

