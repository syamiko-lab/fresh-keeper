'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  onDetected: (barcode: string) => void
}

export default function BarcodeScanner({ onDetected }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const [mode, setMode] = useState<'camera' | 'upload'>('camera')
  const [cameraError, setCameraError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)

  useEffect(() => {
    if (mode !== 'camera') return

    let mounted = true

    async function startCamera() {
      setCameraError('')
      try {
        const { default: Quagga } = await import('@ericblade/quagga2')
        if (!mounted || !containerRef.current) return

        await new Promise<void>((resolve, reject) => {
          Quagga.init(
            {
              inputStream: {
                type: 'LiveStream',
                target: containerRef.current!,
                constraints: { facingMode: 'environment' },
              },
              decoder: {
                readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader'],
              },
              locate: true,
            },
            (err: unknown) => { if (err) reject(err); else resolve() }
          )
        })

        if (!mounted) { Quagga.stop(); return }

        Quagga.start()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Quagga.onDetected((result: any) => {
          const code = result?.codeResult?.code
          if (code) { Quagga.stop(); onDetected(code) }
        })

        cleanupRef.current = () => Quagga.stop()
      } catch {
        if (mounted) setCameraError('カメラを起動できませんでした。画像アップロードをお試しください。')
      }
    }

    startCamera()

    return () => {
      mounted = false
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [mode, onDetected])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError('')
    setUploadLoading(true)
    const url = URL.createObjectURL(file)

    try {
      const { default: Quagga } = await import('@ericblade/quagga2')
      await new Promise<void>((resolve, reject) => {
        Quagga.decodeSingle(
          {
            src: url,
            numOfWorkers: 0,
            decoder: { readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader'] },
            locate: true,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result: any) => {
            const code = result?.codeResult?.code
            if (code) { onDetected(code); resolve() }
            else reject(new Error('not found'))
          }
        )
      })
    } catch {
      setUploadError('バーコードを読み取れませんでした。鮮明な画像をお試しください。')
    } finally {
      URL.revokeObjectURL(url)
      setUploadLoading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <div className="flex rounded-xl overflow-hidden mb-4" style={{ border: '1.5px solid #C8D8C8' }}>
        <button type="button" onClick={() => setMode('camera')} className="flex-1 py-2.5 text-sm font-bold transition-all"
          style={mode === 'camera' ? { backgroundColor: '#4F7A62', color: '#FFF' } : { backgroundColor: '#FAFDF8', color: '#8FA898' }}>
          📷 カメラ
        </button>
        <button type="button" onClick={() => setMode('upload')} className="flex-1 py-2.5 text-sm font-bold transition-all"
          style={mode === 'upload' ? { backgroundColor: '#4F7A62', color: '#FFF' } : { backgroundColor: '#FAFDF8', color: '#8FA898' }}>
          📁 画像
        </button>
      </div>

      {mode === 'camera' && (
        <div>
          <div ref={containerRef} className="rounded-2xl overflow-hidden w-full" style={{ backgroundColor: '#111', aspectRatio: '4/3' }} />
          {cameraError
            ? <p className="text-sm mt-2 text-center" style={{ color: '#B85555' }}>{cameraError}</p>
            : <p className="text-xs text-center mt-2" style={{ color: '#A8B8A8' }}>バーコードをカメラに向けてください</p>
          }
        </div>
      )}

      {mode === 'upload' && (
        <div>
          <label className="block rounded-2xl border-2 border-dashed cursor-pointer text-center py-12" style={{ borderColor: uploadLoading ? '#A8C8B0' : '#C8D8C8' }}>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploadLoading} />
            <p className="text-4xl mb-3">{uploadLoading ? '🔍' : '📁'}</p>
            <p className="text-sm font-medium" style={{ color: '#8FA898' }}>
              {uploadLoading ? '読み取り中...' : 'バーコード画像を選択'}
            </p>
          </label>
          {uploadError && <p className="text-sm mt-2 text-center" style={{ color: '#B85555' }}>{uploadError}</p>}
        </div>
      )}
    </div>
  )
}
