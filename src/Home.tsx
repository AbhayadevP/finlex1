// src/Home.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import {
  Shield,
  Zap,
  Lock,
  ArrowRight,
  ChevronDown,
  Globe,
  Database,
  Cpu,
} from 'lucide-react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

// 3D background component
const ThreeBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(4, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const pointLight = new THREE.PointLight(0x38bdf8, 1.5);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    camera.position.z = 14;

    let frameId: number;

    const animate = () => {
      mesh.rotation.x += 0.002;
      mesh.rotation.y += 0.003;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-70"
    />
  );
};

const Home: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controls = useAnimation();
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className="min-h-screen bg-black overflow-hidden text-white"
      ref={containerRef}
    >
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b border-gray-800 transition-colors ${
          isScrolled ? 'bg-black/80 backdrop-blur-lg' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-black font-bold">
              ₿
            </div>
            <span className="text-xl font-semibold tracking-tight">
              FINLEX
            </span>
          </div>

          <div className="hidden items-center space-x-8 text-sm text-gray-300 md:flex">
            <button
              className="hover:text-white"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>
            <button
              className="hover:text-white"
              onClick={() => navigate('/news')}
            >
              Crypto News
            </button>
            <button
              className="hover:text-white"
              onClick={() => navigate('/contact')}
            >
              Contact Us
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              className="hidden rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-200 hover:border-gray-500 md:inline-flex"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
              onClick={() => navigate('/dashboard')}
            >
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* 3D Background */}
      <ThreeBackground />

      {/* Hero Section */}
      <div className="relative z-10 pt-28 pb-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-3 inline-flex items-center rounded-full bg-blue-600/10 px-3 py-1 text-xs font-medium text-blue-300 ring-1 ring-blue-500/40">
              Next‑Gen Crypto Trading Platform
            </p>
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Start Your Crypto Journey
              <span className="block bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent">
                with Intelligent Insights
              </span>
            </h1>
            <p className="mb-6 text-sm text-gray-300 sm:text-base">
              Analyze markets, track your portfolio, and execute trades with a
              powerful, real‑time crypto dashboard built for serious traders.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
              >
                Launch Trading Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <button
                onClick={scrollToFeatures}
                className="inline-flex items-center rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-200 hover:border-gray-500"
              >
                Learn more
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </div>
          </motion.div>

          <motion.div
            className="mt-10 w-full max-w-md rounded-3xl border border-blue-500/30 bg-gradient-to-b from-slate-900/70 to-black/70 p-6 shadow-xl shadow-blue-500/10 backdrop-blur lg:mt-0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-blue-300">
              Live Market Snapshot
            </p>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Bitcoin (BTC)</span>
                <span className="font-medium text-emerald-400">
                  $72,430.12
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Ethereum (ETH)</span>
                <span className="font-medium text-emerald-400">
                  $3,945.80
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Solana (SOL)</span>
                <span className="font-medium text-emerald-400">$192.30</span>
              </div>
              <p className="pt-3 text-xs text-gray-500">
                *Prices are sample values for UI demonstration.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div
        id="features"
        className="relative z-10 border-t border-gray-800 bg-gradient-to-b from-black via-slate-950 to-black py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Built for modern crypto trading
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-gray-300 sm:text-base">
                Secure, low‑latency infrastructure with analytics, automation,
                and global access baked in from day one.
              </p>
            </div>
            <button
              onClick={() => navigate('/news')}
              className="inline-flex items-center rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-100 hover:border-blue-500 hover:text-blue-300"
            >
              View All Crypto News
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-800 bg-slate-950/70 p-5">
              <div className="mb-4 inline-flex rounded-xl bg-blue-600/10 p-2 text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-sm font-semibold sm:text-base">
                Bank‑grade security
              </h3>
              <p className="text-xs text-gray-400 sm:text-sm">
                Multi‑layer encryption, 2FA, and hardened infrastructure to keep
                your assets and data safe.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-slate-950/70 p-5">
              <div className="mb-4 inline-flex rounded-xl bg-emerald-600/10 p-2 text-emerald-400">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-sm font-semibold sm:text-base">
                Low‑latency execution
              </h3>
              <p className="text-xs text-gray-400 sm:text-sm">
                Optimized order routing and WebSocket data feeds for fast,
                reliable trading signals.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-slate-950/70 p-5">
              <div className="mb-4 inline-flex rounded-xl bg-purple-600/10 p-2 text-purple-400">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-sm font-semibold sm:text-base">
                Deep analytics
              </h3>
              <p className="text-xs text-gray-400 sm:text-sm">
                Historical performance, P&amp;L breakdowns, and position
                analytics in one unified dashboard.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-slate-950/70 p-5">
              <div className="mb-4 inline-flex rounded-xl bg-teal-600/10 p-2 text-teal-400">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-sm font-semibold sm:text-base">
                Global access
              </h3>
              <p className="text-xs text-gray-400 sm:text-sm">
                Monitor markets and your portfolio from anywhere, on any
                device, with a responsive UI.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-800 bg-slate-950/80 p-6">
              <div className="mb-3 inline-flex items-center rounded-full bg-blue-600/10 px-3 py-1 text-xs font-medium text-blue-300">
                <Cpu className="mr-2 h-4 w-4" />
                Smart tooling
              </div>
              <h3 className="mb-2 text-base font-semibold sm:text-lg">
                Automation‑ready infrastructure
              </h3>
              <p className="text-xs text-gray-400 sm:text-sm">
                The stack is built around React, React Query, WebSockets, and
                TypeScript, so you can plug in custom bots, signals, or external
                APIs without changing the core UI.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-slate-950/80 p-6">
              <div className="mb-3 inline-flex items-center rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <Lock className="mr-2 h-4 w-4" />
                Self‑custody friendly
              </div>
              <h3 className="mb-2 text-base font-semibold sm:text-lg">
                Wallet‑centric design
              </h3>
              <p className="text-xs text-gray-400 sm:text-sm">
                Frontend is ready to integrate with wallets and on‑chain data
                providers via libraries like <code>ethers</code> whenever you
                add a backend or smart‑contract layer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
