import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, projectId } = await request.json()

    const activePeriod = await prisma.votingPeriod.findFirst({
      where: {
        isActive: true,
        startTime: { lte: new Date() },
        endTime: { gte: new Date() },
      },
    })

    if (!activePeriod) {
      return NextResponse.json(
        { error: '現在は投票期間ではありません' },
        { status: 400 }
      )
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        userId,
        projectId,
      },
    })

    if (existingVote) {
      return NextResponse.json(
        { error: 'このプロジェクトには既に投票しています' },
        { status: 400 }
      )
    }

    const vote = await prisma.vote.create({
      data: {
        userId,
        projectId,
      },
    })

    return NextResponse.json(vote)
  } catch (error) {
    console.error('投票作成エラー:', error)
    return NextResponse.json(
      { error: '投票の作成に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, projectId } = await request.json()

    await prisma.vote.deleteMany({
      where: {
        userId,
        projectId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('投票削除エラー:', error)
    return NextResponse.json(
      { error: '投票の削除に失敗しました' },
      { status: 500 }
    )
  }
}
