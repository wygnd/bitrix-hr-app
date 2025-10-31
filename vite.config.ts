import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import bitrix24UIPluginVite from '@bitrix24/b24ui-nuxt/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        bitrix24UIPluginVite({
            colorMode: false,
            b24ui: {
                container: {
                    base: 'w-full max-w-[1280px] mx-auto px-[22px]'
                },
                prose: {
                    h1: {
                        slots: {
                            base: 'relative mb-2 scroll-mt-[calc(45px+24px+var(--topbar-height))] lg:scroll-mt-[calc(22px+15px+var(--topbar-height))] text-(length:--ui-font-size-5xl) [&>code]:text-(length:--ui-font-size-4xl)/7',
                            link: 'inline-flex items-center gap-[8px]'
                        },
                        variants: {
                            accent: {
                                default: 'text-(--b24ui-typography-label-color)',
                                accent: 'text-(--ui-color-accent-brand-blue)',
                                'accent-more': 'text-(--ui-color-accent-soft-element-blue)',
                                less: 'text-(--b24ui-typography-description-color)',
                                'less-more': 'text-(--ui-color-design-plain-na-content-secondary)'
                            }
                        },
                        defaultVariants: {
                            accent: 'default'
                        }
                    }
                }
            }
        })
    ]
})
