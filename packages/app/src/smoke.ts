import { Box, Text, createCliRenderer } from '@opentui/core';

const renderer = await createCliRenderer({ exitOnCtrlC: true });

renderer.root.add(
  Box(
    {
      id: 'pit-smoke-box',
      border: true,
      borderStyle: 'rounded',
      padding: 1,
      flexDirection: 'column',
      width: '100%',
      height: '100%',
    },
    Text({ id: 'pit-smoke-title', content: 'pit smoke test', fg: '#00FF00' }),
    Text({ id: 'pit-smoke-hint', content: 'Ctrl+C to exit' }),
  ),
);
