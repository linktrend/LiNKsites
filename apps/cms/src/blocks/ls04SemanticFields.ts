import type { Field, TextField } from 'payload'

/**
 * LS-04 projection metadata is persisted with each promoted block so Payload
 * readback can prove the provider/component/working-section mapping survived
 * the CMS schema boundary. These fields are operational metadata, not editor
 * content, and are therefore read-only and hidden from the admin form.
 */
export const ls04SemanticFields: Field[] = [
  {
    name: 'reactSymbol',
    type: 'text',
    admin: { hidden: true, readOnly: true },
  } satisfies TextField,
  {
    name: 'libraryComponentId',
    type: 'text',
    admin: { hidden: true, readOnly: true },
  } satisfies TextField,
  {
    name: 'semanticId',
    type: 'text',
    admin: { hidden: true, readOnly: true },
  } satisfies TextField,
  {
    name: 'workingSectionId',
    type: 'text',
    admin: { hidden: true, readOnly: true },
  } satisfies TextField,
]
