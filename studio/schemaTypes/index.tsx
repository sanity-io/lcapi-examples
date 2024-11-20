import {ColorWheelIcon, MasterDetailIcon} from '@sanity/icons'
import {Inline, Text} from '@sanity/ui'
import {transparentize} from 'polished'
import {useDeferredValue} from 'react'
import {defineField, defineType, type StringInputProps} from 'sanity'
import {styled} from 'styled-components'

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
  ],
})
