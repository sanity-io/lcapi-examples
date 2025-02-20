import {visionTool} from '@sanity/vision'
/**
 * This plugin contains all the logic for setting up the singletons
 */
import {defineConfig, type DocumentDefinition} from 'sanity'
import {structureTool, type StructureResolver} from 'sanity/structure'
import {demoType, reactionType, themeType} from './schemaTypes'

// The StructureResolver is how we're changing the DeskTool structure to linking to document (named Singleton)
// like how "Home" is handled.
export const pageStructure = (typeDefArray: DocumentDefinition[]): StructureResolver => {
  return (S) => {
    // Goes through all of the singletons that were provided and translates them into something the
    // Structure tool can understand
    const singletonItems = typeDefArray.map((typeDef) => {
      return S.listItem()
        .title(typeDef.title!)
        .icon(typeDef.icon)
        .child(S.editor().id(typeDef.name).schemaType(typeDef.name).documentId(typeDef.name))
    })

    // The default root list items (except custom ones)
    const defaultListItems = S.documentTypeListItems().filter(
      (listItem) => !typeDefArray.find((singleton) => singleton.name === listItem.getId()),
    )

    return S.list()
      .title('Content')
      .items([...singletonItems, S.divider(), ...defaultListItems])
  }
}

export default defineConfig({
  title: 'Live Content API',

  projectId: 'hiomol4a',
  dataset: 'lcapi',

  plugins: [
    structureTool({
      structure: (S) => {
        // The default root list items (except custom ones)
        const defaultListItems = S.documentTypeListItems().filter(
          (listItem) => listItem.getId() !== themeType.name,
        )

        return S.list()
          .title('Content')
          .items([
            S.listItem()
              .title(themeType.title!)
              .icon(themeType.icon)
              .child(
                S.editor().id(themeType.name).schemaType(themeType.name).documentId(themeType.name),
              ),
            S.divider(),
            ...defaultListItems,
          ])
      },
    }),
    visionTool({defaultDataset: 'lcapi'}),
  ],

  document: {
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global') {
        return prev.filter((templateItem) => templateItem.templateId !== themeType.name)
      }

      return prev
    },
    actions: (prev, {schemaType}) => {
      if (schemaType === themeType.name) {
        return prev.filter(({action}) => action !== 'duplicate')
      }

      return prev
    },
  },

  schema: {types: [themeType, demoType, reactionType]},

  releases: {enabled: true},
})
