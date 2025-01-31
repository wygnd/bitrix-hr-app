<script setup lang="ts">
/**
 * @memo This demo
 * Not use at real project
 */
import { ref, type Ref, onMounted, onUnmounted, computed } from 'vue'
import {
	LoggerBrowser,
	initializeB24Frame,
	Text,
	B24Frame
} from '@bitrix24/b24jssdk'

const $logger = LoggerBrowser.build(
	'AppVue: Frame',
	true
)

let $b24: B24Frame
const isInit: Ref<boolean> = ref(false)

onMounted(async() => {
	try {
		$b24 = await initializeB24Frame()
		$b24.setLogger(LoggerBrowser.build('Core', true))
		
		await $b24.parent.setTitle('[playground] Testing Frame')
		
		isInit.value = true
	}
	catch(error: any) {
		$logger.error(error)
	}
})

onUnmounted(() =>  {
	$b24?.destroy()
})

const serverTime = computed(async (): Promise<string> => {
	const response = await $b24.callMethod('server.time');
	const serverTimeResponse = response.getData().result;
	
	return Text.toDateTime(serverTimeResponse).toString();
})
</script>
<template>
	<div class="flex flex-col items-center justify-center gap-16 h-screen">
		<div>Main page content</div>
		<div v-if="!isInit">
			Loading ...
		</div>
		<div v-else>
			ServerTime: {{ serverTime }}
		</div>
		
	</div>
</template>