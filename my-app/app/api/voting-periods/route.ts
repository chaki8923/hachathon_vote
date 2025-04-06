import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _request: NextRequest
) {
  try {
    const votingPeriods = await prisma.votingPeriod.findMany({
      orderBy: {
        startTime: 'desc',
      },
    })

    return NextResponse.json(votingPeriods)
  } catch (error) {
    console.error('投票期間取得エラー:', error)
    return NextResponse.json(
      { error: '投票期間の取得に失敗しました' },
      { status: 500 }
    )
  }
}
