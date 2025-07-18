export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import LoginScreen from '@/components/Login/LoginScreen';

export const metadata = {
  title: 'Login | SiteGrip',
  description: 'Sign in to manage website indexing, uptime and SEO monitoring.',
};

export default function LoginPage() {
  return <LoginScreen />;
}
