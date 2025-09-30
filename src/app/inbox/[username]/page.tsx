/**
 * Inbox page - Direct access to email inbox
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import InboxPage from './components/InboxPage';

interface Props {
  params: Promise<{ username: string }>;
}

export default async function Page({ params }: Props) {
  const { username } = await params;
  return <InboxPage username={username} />;
}

