import DATA from './genogram.js'

const {Graph, Shape} = window.X6

// region 生成画布
const boxDom = document.getElementById('box')
export const graph = new Graph({
    container: document.getElementById('container'),
    width: boxDom.clientWidth,
    height: boxDom.clientHeight,
    background: {
        color: "#F2F7FA",
    },
    panning: true,
    mousewheel: true,
    grid: true,
    autoResize: true,
    interacting: {
        nodeMovable: true,
        edgeMovable: true,
    },
})

// endregion
// 注册边
Graph.registerEdge('x6-edge', {
    zIndex: -1,
    attrs: {
        line: {
            fill: 'none',
            strokeLinejoin: 'round',
            strokeWidth: 1,
            stroke: '#5F95FF',
            sourceMarker: null,
            targetMarker: null,
        },
    },
}, true)
// 注册节点
Shape.HTML.register({
    shape: 'html-node',
    width: 200,
    height: 100,
    html: (cell) => {
        const data = cell.getData()
        const wrap = document.createElement('div')
        wrap.className = 'wrap'
        wrap.innerHTML = `
            <div>${data['姓名']}</div>
            <div>${data['详情']}</div>
            `

        const header = document.createElement('div')
        header.className = 'node-header'
        header.innerText = data['关系']
        wrap.appendChild(header)
        if (data.gender === 'male') {
            wrap.classList.add('male')
            header.style.backgroundColor = '#9254de'
        } else {
            wrap.classList.add('female')
            header.style.backgroundColor = '#BC53AB'
        }
        return wrap
    },
})
Shape.HTML.register({
    shape: 'html-point',
    width: 200,
    height: 100,
    html: (cell) => {
        const data = cell.getData()
        const wrap = document.createElement('div')
        wrap.className = 'html-point'
        wrap.style.width = `${loveSize}px`
        wrap.style.height = `${loveSize}px`
        return wrap
    },
})

/**
 * 生成节点
 * @param x
 * @param y
 * @param people
 * @param config
 * @returns {*}
 */
export function generateNode(x, y, people, config = {}) {
    return graph.addNode({
        x,
        y,
        // shape: 'x6-node',
        shape: 'html-node',
        attrs: {
            name: {
                text: `${people['姓名'] || ''}`
            },
            ...config.attrs
        },
        data: people
    })
}

/**
 * 连线节点
 * @param source
 * @param target
 * @param vertices
 * @param config
 * @returns {*}
 */
export function link(source, target, vertices, config) {
    return graph.addEdge({
        shape: 'x6-edge',
        // connector: {
        //     name: 'rounded',
        //     args: {radius: 10},
        // },
        source: {
            cell: source,
        },
        target: {
            cell: target,
        },

        vertices,
        ...(config ? config : {
            attrs: {
                line: {
                    // targetMarker: 'classic',
                },
            }
        })

    })
}

export function isMale(baseData) {
    return baseData.gender === 'male'
}

/**
 * 获取最大同辈数量
 * @param data
 * @param max
 * @returns {number|number}
 */
export function getMaxPeerNum(data, max = 0) {
    let maxNum = 0
    const peers = DATA.filter(item => item.id !== data.id && data.mid && data.fid && (item.mid === data.mid || item.fid === data.fid))
    maxNum = max > peers.length ? max : peers.length
    return maxNum
}

/**
 * 对象的数量
 * @param data
 * @param max
 * @returns {number}
 */
export function getMaxCoupleNum(data, max = 0) {
    let maxNum = 0
    if (data?.pids && data.pids.length >= 2) {
        const couples = DATA.filter(item => data.pids.includes(item.id + ''))
        maxNum = Math.ceil((maxNum >= couples.length ? maxNum : couples.length) / 2) // 除以 2 因为，目前多个妻子是左右分布的。
    } else if (data?.pids && data.pids.length < 2) {
        maxNum = data.pids.length === 1 ? 1 : 0
    }
    return maxNum
}

