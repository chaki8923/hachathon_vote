import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.vote.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.votingPeriod.deleteMany({})

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: '管理者',
      isAdmin: true,
    },
  })

  const users = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.user.create({
        data: {
          email: `user${i + 1}@example.com`,
          name: `ユーザー${i + 1}`,
          isAdmin: false,
        },
      })
    )
  )

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'AI写真編集アプリ',
        teamName: 'チームA',
        description: 'AIを使って写真を自動編集するアプリケーション',
        appealPoint: '使いやすいインターフェースと高速な処理が特徴です',
        demoUrl: 'https://example.com/demo1',
        imageUrl: '/projects/project1.jpg',
      },
    }),
    prisma.project.create({
      data: {
        name: 'スマートホーム制御システム',
        teamName: 'チームB',
        description: '家電をスマートフォンで簡単に制御できるシステム',
        appealPoint: '互換性のある家電製品が多く、簡単にセットアップできます',
        demoUrl: 'https://example.com/demo2',
        imageUrl: '/projects/project2.jpg',
      },
    }),
    prisma.project.create({
      data: {
        name: '健康管理アプリ',
        teamName: 'チームC',
        description: '食事と運動を記録して健康状態を管理するアプリ',
        appealPoint: 'シンプルなUIと詳細な分析機能が特徴です',
        demoUrl: 'https://example.com/demo3',
        imageUrl: '/projects/project3.jpg',
      },
    }),
    prisma.project.create({
      data: {
        name: 'オンライン教育プラットフォーム',
        teamName: 'チームD',
        description: 'インタラクティブな学習体験を提供するプラットフォーム',
        appealPoint: 'ゲーミフィケーション要素で学習のモチベーションを高めます',
        demoUrl: 'https://example.com/demo4',
        imageUrl: '/projects/project4.jpg',
      },
    }),
    prisma.project.create({
      data: {
        name: '地域イベント発見アプリ',
        teamName: 'チームE',
        description: '近隣で開催されるイベントを発見・共有できるアプリ',
        appealPoint: '位置情報を活用した精度の高いイベント推薦機能があります',
        demoUrl: 'https://example.com/demo5',
        imageUrl: '/projects/project5.jpg',
      },
    }),
  ])

  const now = new Date()
  const endDate = new Date()
  endDate.setDate(now.getDate() + 7)

  await prisma.votingPeriod.create({
    data: {
      startTime: now,
      endTime: endDate,
      isActive: true,
    },
  })

  for (let i = 0; i < users.length; i++) {
    const projectIndex = i % projects.length
    await prisma.vote.create({
      data: {
        userId: users[i].id,
        projectId: projects[projectIndex].id,
      },
    })
  }

  console.log('シードデータが正常に登録されました')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
