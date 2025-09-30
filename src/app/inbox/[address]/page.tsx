/**
 * Inbox page - Direct access to email inbox
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import InboxPage from './components/InboxPage';

interface Props {
  params: Promise<{ address: string }>;
}

export default async function Page({ params }: Props) {
  const { address } = await params;
  return <InboxPage address={address} />;
}

