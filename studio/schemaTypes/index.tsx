import {ColorWheelIcon, HeartIcon, MasterDetailIcon} from '@sanity/icons'
import {Inline, Text} from '@sanity/ui'
import {transparentize} from 'polished'
import {useDeferredValue} from 'react'
import {defineField, defineType, type StringInputProps} from 'sanity'
import {styled} from 'styled-components'

export const reactionType = defineType({
  liveEdit: true,
  name: 'reaction',
  title: 'Reaction',
  type: 'document',
  icon: HeartIcon,

  fields: [
    defineField({
      name: 'emoji',
      title: 'Emoji',
      type: 'string',
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) return true // Let required() handle empty values

          const segmenter = new Intl.Segmenter('en', {granularity: 'grapheme'})
          const segments = Array.from(segmenter.segment(value.trim()))

          if (segments.length !== 1) {
            return 'Must contain exactly one emoji character'
          }

          return true
        }),
    }),
    defineField({
      name: 'reactions',
      title: 'Reactions',
      type: 'number',
      validation: (rule) => rule.required().integer().positive(),
      initialValue: 0,
    }),
  ],

  preview: {
    select: {
      emoji: 'emoji',
      reactions: 'reactions',
    },
    prepare({emoji, reactions}) {
      const numberFormat = new Intl.NumberFormat('en', {notation: 'compact'})
      const formatted = numberFormat.format(reactions)

      return {
        title: `${formatted} ${reactions === 1 ? 'reaction' : 'reactions'}`,
        media: () => <span style={{fontSize: '1.5em'}}>{emoji}</span>,
      }
    },
  },
})

export const themeType = defineType({
  liveEdit: true,
  name: 'theme',
  title: 'Theme',
  type: 'document',
  icon: ColorWheelIcon,
  fields: [
    defineField({
      name: 'background',
      title: 'Background Color',
      type: 'text',
      components: {input: ColorInput},
    }),
    defineField({
      name: 'text',
      title: 'Text Color',
      type: 'text',
      components: {input: ColorInput},
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Theme',
      }
    },
  },
})

function ColorInput(props: StringInputProps) {
  const {elementProps} = props
  const deferredValue = useDeferredValue(elementProps.value)

  return (
    <Inline space={2}>
      <StyledColorInput {...elementProps} />
      <Text as="output" htmlFor={elementProps.id} size={0}>
        {deferredValue}
      </Text>
    </Inline>
  )
}

const StyledColorInput = styled.input.attrs({type: 'color'})`
  cursor: pointer;
  box-sizing: border-box;
  background: var(--card-border-color);
  border: 0 solid transparent;
  border-radius: 2px;
  padding: 0;
  appearance: none;
  margin: 0;
  height: 1.6rem;
  width: 8ch;

  &:hover {
    box-shadow: 0 0 0 2px ${({theme}) => theme.sanity.color.card.hovered.border};
  }

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    padding: 0;
    border: 0 solid transparent;
    border-radius: 2px;
    box-shadow: inset 0 0 0 1px
      ${({theme}) => transparentize(0.8, theme.sanity.color.card.enabled.fg)};
  }

  &::-moz-color-swatch {
    padding: 0;
    border: 0 solid transparent;
    border-radius: 2px;
    box-shadow: inset 0 0 0 1px
      ${({theme}) => transparentize(0.8, theme.sanity.color.card.enabled.fg)};
  }
`

export const demoType = defineType({
  name: 'demo',
  title: 'Demo',
  type: 'document',
  icon: MasterDetailIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reactions',
      title: 'Reactions',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'reaction'}],
        },
      ],
      validation: (rule) => rule.required().min(3).max(5),
      options: {
        layout: 'grid',
        sortable: true,
      },
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'A slug is required for the post to show up in the preview',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
  ],
})
